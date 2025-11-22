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
            <div className="hero py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-18 2xl:py-20 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
                <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                    <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        <Package className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-brand" />
                    </div>
                    <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-center text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        Shipping Policy
                    </h1>
                    <p className="text-center text-fg-muted text-base xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl max-w-xl xs:max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                        Fast, reliable shipping for your little ones. Learn about our delivery process, rates, and timelines.
                    </p>
                    <p className="text-center text-fg-subtle text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base mt-2 xs:mt-2.5 sm:mt-3 md:mt-4">
                        Last Updated: November 02, 2025
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-container mx-auto px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-8 xs:pb-10 sm:pb-12 md:pb-14 lg:pb-16 xl:pb-20">
                <div className="max-w-3xl xs:max-w-3xl sm:max-w-4xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-6 xs:space-y-7 sm:space-y-8 md:space-y-10">

                    {/* Introduction */}
                    <section className="card bg-brand/5 border-brand/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Package className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Our Commitment</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    At <span className="font-semibold text-fg">Kiddos Intallcat</span>, we strive to provide our customers with fast and reliable shipping services. This Shipping Policy outlines the terms and conditions under which we will process and deliver orders. By placing an order with us, you agree to the terms of this Shipping Policy.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Methods */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Truck className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Shipping Methods</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    We use various shipping methods, such as courier services, to deliver our orders, depending on the destination and urgency of the order. Normally, the shipping method is chosen by the company to ensure the most efficient delivery. However, we consider customer preferences when possible.
                                </p>
                                <div className="bg-surface rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        <span className="font-semibold">Note:</span> The final decision on the shipping method rests with Kiddos Intallcat to ensure optimal delivery.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping Rates */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <MapPin className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Shipping Rates</h2>
                                <p className="text-fg-muted leading-relaxed mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The shipping rates vary depending on the destination, weight, and shipping method chosen. The shipping rates will be displayed during the checkout process before the order is confirmed.
                                </p>
                                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                                    <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                        <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                            <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-success" />
                                            <span className="font-semibold text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Location</span>
                                        </div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">Based on your location</p>
                                    </div>
                                    <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                        <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                            <Package className="w-4 h-4 xs:w-5 xs:h-5 text-success" />
                                            <span className="font-semibold text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Weight</span>
                                        </div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">Package dimensions & weight</p>
                                    </div>
                                    <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                        <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                            <Truck className="w-4 h-4 xs:w-5 xs:h-5 text-success" />
                                            <span className="font-semibold text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Service</span>
                                        </div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">Standard or express delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Timeframes */}
                    <section className="card bg-accent/5 border-accent/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Clock className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Delivery Timeframes</h2>
                                <p className="text-fg-muted leading-relaxed mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    The estimated delivery time depends on the shipping method chosen and the destination. We will provide the estimated delivery time at the time of order confirmation.
                                </p>
                                <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 xs:gap-3.5 sm:gap-4 md:gap-5 mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                                    <div className="bg-surface rounded-lg p-4 xs:p-4.5 sm:p-5 md:p-6 border border-border text-center">
                                        <div className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl font-bold text-brand mb-1 xs:mb-1.5 sm:mb-2">7 Days</div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">Standard Delivery</p>
                                    </div>
                                    <div className="bg-surface rounded-lg p-4 xs:p-4.5 sm:p-5 md:p-6 border border-border text-center">
                                        <div className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl font-bold text-success mb-1 xs:mb-1.5 sm:mb-2">3-4 Days</div>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">Express Delivery</p>
                                    </div>
                                </div>
                                <div className="bg-surface rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border-subtle">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm font-semibold mb-1">Please Note:</p>
                                            <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">
                                                Delivery times may vary due to unforeseen circumstances, such as inclement weather, local holidays, or customs clearance delays. In case of unavoidable circumstances from our side or stock-related issues, we will contact you and mention the revised time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Order Tracking */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Search className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Order Tracking</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    We provide order tracking information to the customers through email/SMS. Customers can track their order status using the provided tracking number.
                                </p>
                                <div className="bg-brand/5 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-brand/20">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <Shield className="w-4 h-4 xs:w-5 xs:h-5 text-brand flex-shrink-0 mt-0.5" />
                                        <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
                                            Once shipped, you'll receive a tracking number via email and SMS to monitor your package in real-time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Product Availability */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <Package className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Product Availability</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    We make all efforts to ensure that the products are available and ready to ship. However, there may be instances when the product is out of stock, in which case we will notify the customer of the expected availability and delivery time.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Delivery Address */}
                    <section className="card bg-danger-soft/30 border-danger/20">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-danger/10 flex items-center justify-center">
                                <MapPin className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-danger" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Delivery Address</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    It is the responsibility of the customer to provide a correct and complete delivery address at the time of order placement. Any changes or corrections to the delivery address should be communicated to us as soon as possible.
                                </p>
                                <div className="bg-surface rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-danger/30">
                                    <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
                                        We are not liable for any delay in delivery or loss of the package due to an incorrect or incomplete delivery address provided by the customer or due to any other unforeseen circumstances beyond our control.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cancellation Policy */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Ban className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Cancellation Policy</h2>
                                <p className="text-fg-muted leading-relaxed mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    Once the order has been shipped, it cannot be canceled. If the customer wishes to cancel the order before shipping, they should contact us immediately.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border">
                                    <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3">
                                        <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm font-semibold mb-1">Important:</p>
                                            <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm">
                                                Orders cannot be canceled once they have left our facility. Please contact us promptly if you need to make changes to your order.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Changes to Policy */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Changes to Policy</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    We reserve the right to modify this Shipping Policy at any time without prior notice. Any modifications will be posted on our website and will be effective immediately.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Summary Card */}
                    <section className="card bg-brand text-brand-foreground">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold mb-3 xs:mb-3.5 sm:mb-4 md:mb-5 text-center">Shipping at a Glance</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="bg-brand-foreground/10 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5">
                                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <Clock className="w-4 h-4 xs:w-5 xs:h-5 text-brand-foreground" />
                                    <span className="font-semibold text-brand-foreground text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Processing Time</span>
                                </div>
                                <p className="text-brand-foreground/80 text-xs xs:text-xs sm:text-sm md:text-sm">Orders processed within 24-48 hours</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5">
                                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <Truck className="w-4 h-4 xs:w-5 xs:h-5 text-brand-foreground" />
                                    <span className="font-semibold text-brand-foreground text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Delivery Time</span>
                                </div>
                                <p className="text-brand-foreground/80 text-xs xs:text-xs sm:text-sm md:text-sm">3-7 business days (location dependent)</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5">
                                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <Search className="w-4 h-4 xs:w-5 xs:h-5 text-brand-foreground" />
                                    <span className="font-semibold text-brand-foreground text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Tracking</span>
                                </div>
                                <p className="text-brand-foreground/80 text-xs xs:text-xs sm:text-sm md:text-sm">Email & SMS notifications with tracking number</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5">
                                <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-brand-foreground" />
                                    <span className="font-semibold text-brand-foreground text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Address</span>
                                </div>
                                <p className="text-brand-foreground/80 text-xs xs:text-xs sm:text-sm md:text-sm">Customer responsibility for accuracy</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="card bg-success-soft border-success/20 text-center">
                        <Package className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 text-success mx-auto mb-3 xs:mb-3.5 sm:mb-4 md:mb-5" />
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Have Questions?</h2>
                        <p className="text-fg-muted mb-4 xs:mb-5 sm:mb-6 md:mb-7 max-w-2xl mx-auto text-sm xs:text-sm sm:text-base md:text-base lg:text-lg">
                            If you have any questions or concerns about our shipping policy, please don't hesitate to contact our customer support team.
                        </p>
                        <a href="/contact" className="btn-primary text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">
                            Contact Support
                        </a>
                    </section>

                </div>
            </div>

            <ScrollToTopButton />
        </div>
    );
};

export default ShippingPolicy;
