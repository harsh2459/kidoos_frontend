import React, { useEffect } from 'react';
import { Package, Truck, MapPin, Clock, Shield, AlertCircle, Search, Ban } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ShippingPolicy = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-surface-subtle">
            {/* Hero Section */}
            <div className="hero py-16 mb-12">
                <div className="max-w-container mx-auto px-6">
                    <div className="flex items-center justify-center mb-4">
                        <Truck className="w-12 h-12 text-brand" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-fg mb-4">
                        Shipping Policy
                    </h1>
                    <p className="text-center text-fg-muted text-lg max-w-2xl mx-auto">
                        Fast, reliable shipping for your little ones. Learn about our delivery process, rates, and timelines.
                    </p>
                    <p className="text-center text-fg-subtle text-sm mt-3">
                        Last Updated: November 02, 2025
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-container mx-auto px-6 pb-16">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Introduction */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-fg mb-3">Our Commitment</h2>
                                <p className="text-fg-muted leading-relaxed">
                                    At Kiddos Intallcat, we strive to provide our customers with fast and reliable shipping services.
                                    This Shipping Policy outlines the terms and conditions under which we will process and deliver orders.
                                    By placing an order with us, you agree to the terms of this Shipping Policy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Methods */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">Shipping Methods</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    We use various shipping methods, such as courier services, to deliver our orders, depending on the
                                    destination and urgency of the order. Normally, the shipping method is chosen by the company to ensure
                                    the most efficient delivery. However, we consider customer preferences when possible.
                                </p>
                                <div className="bg-surface-subtle border border-border-subtle rounded-lg p-4">
                                    <p className="text-fg text-sm font-semibold">
                                        Note: The final decision on the shipping method rests with Kiddos Intallcat to ensure optimal delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Rates */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-4">Shipping Rates</h2>
                        <p className="text-fg-muted leading-relaxed mb-4">
                            The shipping rates vary depending on the destination, weight, and shipping method chosen. The shipping
                            rates will be displayed during the checkout process before the order is confirmed.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                <div className="font-semibold text-fg mb-2">Destination</div>
                                <p className="text-fg-subtle text-sm">Based on your location</p>
                            </div>
                            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                <div className="font-semibold text-fg mb-2">Weight</div>
                                <p className="text-fg-subtle text-sm">Package dimensions & weight</p>
                            </div>
                            <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                <div className="font-semibold text-fg mb-2">Method</div>
                                <p className="text-fg-subtle text-sm">Standard or express delivery</p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Time */}
                    <section className="card bg-brand/5 border-brand/20">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">Delivery Time</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    The estimated delivery time depends on the shipping method chosen and the destination. We will provide
                                    the estimated delivery time at the time of order confirmation.
                                </p>
                                <div className="bg-surface rounded-lg p-4 mb-4 border border-border">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-brand font-semibold mb-1">Maximum Delivery Time</div>
                                            <p className="text-fg text-2xl font-bold">7 Days</p>
                                        </div>
                                        <div>
                                            <div className="text-brand font-semibold mb-1">Average Delivery (Nearby)</div>
                                            <p className="text-fg text-2xl font-bold">3-4 Days</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-fg-muted flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-fg-muted text-sm leading-relaxed">
                                                <span className="font-semibold text-fg">Please Note:</span> Delivery times may vary due to
                                                unforeseen circumstances, such as inclement weather, local holidays, or customs clearance delays.
                                                In case of unavoidable circumstances from our side or stock-related issues, we will contact you
                                                and mention the revised time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Order Tracking */}
                    {/* <section className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-fg mb-3">Order Tracking</h2>
                <p className="text-fg-muted leading-relaxed mb-4">
                  We provide order tracking information to the customers through email/SMS. Customers can track their 
                  order status using the provided tracking number.
                </p>
                <div className="bg-success-soft rounded-lg p-4 border border-success/20">
                  <p className="text-success text-sm font-semibold">
                    Once shipped, you'll receive a tracking number via email and SMS to monitor your package in real-time.
                  </p>
                </div>
              </div>
            </div>
          </section> */}

                    {/* Product Availability */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-3">Product Availability</h2>
                        <p className="text-fg-muted leading-relaxed">
                            We make all efforts to ensure that the products are available and ready to ship. However, there may be
                            instances when the product is out of stock, in which case we will notify the customer of the expected
                            availability and delivery time.
                        </p>
                    </section>

                    {/* Delivery Address */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-brand" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">Delivery Address</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    It is the responsibility of the customer to provide a correct and complete delivery address at the
                                    time of order placement. Any changes or corrections to the delivery address should be communicated to
                                    us as soon as possible.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                                    <h3 className="text-fg font-semibold mb-2 text-sm">Address Requirements:</h3>
                                    <ul className="space-y-1 text-fg-muted text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Complete street address with apartment/unit number if applicable</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Accurate city, state, and ZIP/postal code</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Contact phone number for delivery coordination</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Liability */}
                    <section className="card">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-danger" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">Liability</h2>
                                <p className="text-fg-muted leading-relaxed">
                                    We are not liable for any delay in delivery or loss of the package due to an incorrect or incomplete
                                    delivery address provided by the customer or due to any other unforeseen circumstances beyond our control.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Cancellation */}
                    <section className="card bg-surface-subtle">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                                <Ban className="w-5 h-5 text-danger" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-fg mb-3">Cancellation</h2>
                                <p className="text-fg-muted leading-relaxed mb-4">
                                    Once the order has been shipped, it cannot be canceled. If the customer wishes to cancel the order
                                    before shipping, they should contact us immediately.
                                </p>
                                <div className="bg-danger-soft rounded-lg p-4 border border-danger/20">
                                    <p className="text-danger text-sm font-semibold">
                                        Important: Orders cannot be canceled once they have left our facility. Please contact us promptly
                                        if you need to make changes to your order.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Modifications */}
                    <section className="card">
                        <h2 className="text-2xl font-bold text-fg mb-3">Modifications</h2>
                        <p className="text-fg-muted leading-relaxed">
                            We reserve the right to modify this Shipping Policy at any time without prior notice. Any modifications
                            will be posted on our website and will be effective immediately.
                        </p>
                    </section>

                    {/* Quick Reference */}
                    <section className="card bg-brand text-brand-foreground">
                        <h2 className="text-2xl font-bold mb-6 text-center">Shipping Quick Reference</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <h3 className="font-semibold">Processing Time</h3>
                                </div>
                                <p className="text-sm opacity-90">Orders processed within 24-48 hours</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck className="w-5 h-5" />
                                    <h3 className="font-semibold">Standard Delivery</h3>
                                </div>
                                <p className="text-sm opacity-90">3-7 business days (location dependent)</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Search className="w-5 h-5" />
                                    <h3 className="font-semibold">Order Tracking</h3>
                                </div>
                                <p className="text-sm opacity-90">Email & SMS notifications with tracking number</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="w-5 h-5" />
                                    <h3 className="font-semibold">Delivery Address</h3>
                                </div>
                                <p className="text-sm opacity-90">Customer responsibility for accuracy</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="card">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-fg mb-3">Questions About Shipping?</h2>
                            <p className="text-fg-muted mb-6">
                                If you have any questions or concerns about our shipping policy, please don't hesitate to contact our
                                customer support team.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="mailto:kiddosintallcat.com"
                                    className="btn-primary"
                                >
                                    Contact Support
                                </a>
                                {/* <a 
                  href="/track-order" 
                  className="btn-secondary flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Track Your Order
                </a> */}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            <ScrollToTopButton />
        </div>
    );
};

export default ShippingPolicy;
