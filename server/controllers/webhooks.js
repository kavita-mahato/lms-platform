import { Webhook } from 'svix';
import User from '../models/User.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';

// API Controller function to manage Clerk User with Webhooks
export const clerkWebHooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers['svix-id'],
            "svix-timestamp": req.headers['svix-timestamp'],
            "svix-signature": req.headers['svix-signature']
        });
        const { data, type } = req.body;

        // Handle user creation or update based on the webhook event type
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + ' ' + data.last_name,
                    imageUrl: data.image_url,
                    role: 'student',
                }
                await User.create(userData);
                res.json({});
                break;
            }
            case 'user.updated': {
                const userData = {
                    name: data.first_name + ' ' + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData);
                res.json({});
                break;
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                res.json({});
                break;
            }
            default: {
                break;
            }
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                // Getting Session Metadata
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                if (!session.data.length || !session.data[0].metadata?.purchaseId) {
                    console.error('No session or purchaseId found for payment_intent:', paymentIntentId);
                    return response.status(400).send('No session metadata found');
                }

                const { purchaseId } = session.data[0].metadata;

                const purchaseData = await Purchase.findById(purchaseId);
                if (!purchaseData) {
                    console.error('Purchase not found:', purchaseId);
                    return response.status(400).send('Purchase not found');
                }

                const userData = await User.findById(purchaseData.userId);
                const courseData = await Course.findById(purchaseData.courseId.toString());

                if (!userData || !courseData) {
                    console.error('User or Course not found');
                    return response.status(400).send('User or Course not found');
                }

                // Use findByIdAndUpdate to avoid full document validation
                await Course.findByIdAndUpdate(courseData._id, {
                    $addToSet: { enrolledStudents: purchaseData.userId }
                });

                await User.findByIdAndUpdate(userData._id, {
                    $addToSet: { enrolledCourses: courseData._id }
                });

                purchaseData.status = 'completed';
                await purchaseData.save();

                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;

                // Getting Session Metadata
                const session = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                });

                if (!session.data.length || !session.data[0].metadata?.purchaseId) {
                    console.error('No session found for failed payment_intent:', paymentIntentId);
                    return response.status(400).send('No session metadata found');
                }

                const { purchaseId } = session.data[0].metadata;

                const purchaseData = await Purchase.findById(purchaseId);
                if (purchaseData) {
                    purchaseData.status = 'failed';
                    await purchaseData.save();
                }

                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err) {
        console.error('Webhook processing error:', err);
        return response.status(500).send(`Webhook processing error: ${err.message}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
}
