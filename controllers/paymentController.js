
const { model } = require('mongoose');
const bookingModel = require('../models/bookingModel')
const paymentModel = require('../models/paymentModel');
const turfModel = require('../models/turfModel');
const Stripe = require('stripe')
const stripe = new Stripe(process.env.STRIPE_SECRET)

//PAYMENT FUNCTIONS
const payment = async (req, res) => {
    try {
        const { bookings } = req.body;
        const lineItems = [];
        for (const booking of bookings) {
            const { turfId, time_From, time_To, priceEstimate } = booking;

            const turf = await turfModel.findById(turfId);
            if (!turf) {
                return res.status(404).json({ success: false, message: "Turf not found" });
            }
            const fromHour = parseInt(time_From.split(':')[0]);
            const toHour = parseInt(time_To.split(':')[0]);
            const duration = toHour - fromHour;


            let totalAmount = Math.round(priceEstimate * 100);


            lineItems.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: turf.name,
                        images: [turf.image]
                    },
                    unit_amount: totalAmount,
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment/success`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/failed`

        })
        res.status(200).json({ success: true, sessionId: session.id })


    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = { payment }