import React, { useEffect } from 'react';
import { RefreshCw, XCircle, CheckCircle, AlertTriangle, CreditCard, Package, Mail, Phone, Shield, FileText } from 'lucide-react';
import ScrollToTopButton from '../components/ScrollToTopButton';

const RefundPolicy = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-surface-subtle">
            {/* Hero Section */}
            <div className="hero py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16 xl:py-18 2xl:py-20 mb-6 xs:mb-7 sm:mb-8 md:mb-10 lg:mb-12">
                <div className="max-w-container mx-auto px-6">
                    <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        <RefreshCw className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-brand" />
                    </div>
                    <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-6xl font-bold text-center text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                        Refund Policy
                    </h1>
                    <p className="text-center text-fg-muted text-base xs:text-base sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-2xl max-w-xl xs:max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto">
                        Understanding our refund terms helps ensure a transparent shopping experience for your little ones.
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
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                                <Shield className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand" />
                            </div>
                            <div>
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Our Commitment</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    At Kiddos Intallcat, we strive to provide high-quality products to our customers. We value our
                                    customers' satisfaction and aim to deliver excellent products and services. However, due to the
                                    nature of our business, we have specific refund policies outlined below.
                                </p>
                                <div className="bg-brand/5 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-brand/20">
                                    <p className="text-fg text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold">
                                        By placing an order with Kiddos Intallcat, you acknowledge that you have read, understood, and
                                        agree to the terms of this Refund Policy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* General Policy */}
                    <section className="card bg-surface-subtle border-2 border-border">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-danger/10 flex items-center justify-center">
                                <XCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-danger" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">General Policy</h2>
                                <div className="bg-danger-soft rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-danger/20 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">
                                    <p className="text-danger font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">No Refund Policy - Important Notice</p>
                                    <p className="text-danger text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base">
                                        All sales are final. We do not offer refunds or exchanges for any products or services once an
                                        order has been placed and confirmed, except under specific circumstances outlined below.
                                    </p>
                                </div>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    This policy applies to all products and services, including but not limited to physical products,
                                    digital products, custom or personalized products, and any other services provided by Kiddos Intallcat.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Duplicate Payments */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-success/10 flex items-center justify-center">
                                <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Duplicate Payments</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    If a duplicate payment is made, customers may be eligible for a refund of the duplicate amount.
                                    In such cases, please contact our customer support team with proof of the duplicate payment.
                                </p>
                                <div className="bg-success-soft rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-success/20">
                                    <p className="text-success text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold">
                                        We will review and process the refund within 10 business days if eligible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Order Cancellations */}
                    <section className="card">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Order Cancellations</h2>

                        <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 md:space-y-5">
                            <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border-subtle">
                                <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 text-fg-muted flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-fg font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Before Work Starts</h3>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed">
                                            Orders cannot be canceled once the work has started. If an order is canceled by the customer
                                            before the work has started, a refund may be provided at the company's discretion, less any
                                            administrative or processing fees incurred.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border-subtle">
                                <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2">
                                    <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-success flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-fg font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Company-Initiated Cancellation</h3>
                                        <p className="text-fg-muted text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base leading-relaxed">
                                            If the order is canceled by the company due to unforeseen circumstances, such as unavailability
                                            of resources or inability to complete the work within the agreed deadline, a full refund will
                                            be provided.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>



                    {/* Custom or Personalized Products */}
                    <section className="card">
                        <div className="flex items-start gap-3 xs:gap-3.5 sm:gap-4 md:gap-5">
                            <div className="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Package className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Custom or Personalized Products</h2>
                                <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                                    No refunds are available for custom or personalized products, such as engraved items, monogrammed
                                    products, or custom-designed items, once the order has been confirmed.
                                </p>
                                <div className="bg-surface-subtle rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-border-subtle">
                                    <h3 className="text-fg font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base text-sm">Examples Include:</h3>
                                    <ul className="space-y-1 text-fg-muted text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Custom engraved products</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Made-to-order items with specific customizations</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-brand mt-1">•</span>
                                            <span>Special order items</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Shipping and Handling Charges */}
                    <section className="card bg-surface-subtle">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Shipping and Handling Charges</h2>
                        <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                            Shipping and handling charges are non-refundable under any circumstances, even if a refund is approved
                            for the product itself.
                        </p>
                        <div className="bg-surface rounded-lg p-4 border border-border">
                            <p className="text-fg text-sm">
                                This applies to all shipping methods including standard, expedited, and international shipping.
                            </p>
                        </div>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="card">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">Dispute Resolution</h2>
                        <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                            If the customer disputes the refund decision, they may request a review by our management team.
                        </p>
                        <div className="bg-brand/5 rounded-lg p-3 xs:p-3.5 sm:p-4 md:p-5 border border-brand/20">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-fg font-semibold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base">Review Process</p>
                                    <p className="text-fg-muted text-sm">
                                        The management team will review the request and provide a final decision within 10 business days.
                                        This decision will be final and binding.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* No Return of Goods */}
                    <section className="card">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">No Return of Goods</h2>
                        <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                            We recommend using an insured and trackable mail service as we will not be responsible for goods
                            damaged or lost in return shipment.
                        </p>
                        <div className="bg-danger-soft rounded-lg p-4 border border-danger/20">
                            <p className="text-danger text-xs xs:text-xs sm:text-sm md:text-sm lg:text-base xl:text-base font-semibold">
                                Refunds will not be issued without actual receipt of the goods or proof of received return delivery.
                            </p>
                        </div>
                    </section>

                    {/* Modifications to Policy */}
                    <section className="card">
                        <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Modifications to Policy</h2>
                        <p className="text-fg-muted leading-relaxed text-sm xs:text-sm sm:text-base md:text-base lg:text-lg xl:text-lg">
                            We reserve the right to modify this refund policy at any time without prior notice. Any modifications
                            will be posted on our website and will be effective immediately. We encourage you to review this policy
                            periodically for any changes.
                        </p>
                    </section>

                    {/* Quick Reference */}
                    <section className="card bg-brand text-brand-foreground">
                        <h2 className="text-2xl font-bold mb-6 text-center">Refund Policy Quick Reference</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <XCircle className="w-5 h-5" />
                                    <h3 className="font-semibold">General Sales</h3>
                                </div>
                                <p className="text-sm opacity-90">All sales are final - No refunds</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <h3 className="font-semibold">Duplicate Payments</h3>
                                </div>
                                <p className="text-sm opacity-90">Eligible for refund within 10 days</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="font-semibold">Digital Products</h3>
                                </div>
                                <p className="text-sm opacity-90">No refunds once accessed/downloaded</p>
                            </div>
                            <div className="bg-brand-foreground/10 rounded-lg p-4 border border-brand-foreground/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Package className="w-5 h-5" />
                                    <h3 className="font-semibold">Custom Items</h3>
                                </div>
                                <p className="text-sm opacity-90">No refunds on personalized products</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="card">
                        <div className="text-center">
                            <h2 className="text-xl xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl font-bold text-fg mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">Questions or Concerns?</h2>
                            <p className="text-fg-muted mb-6 max-w-2xl mx-auto">
                                If you have any questions or need further clarification about our refund policy, please contact our
                                customer support team. We're here to help!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="mailto:kiddosintellect@gmail.com"
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Email Support
                                </a>
                                <a
                                    href="tel:+9198798 57529"
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Us
                                </a>
                            </div>
                            <div className="mt-6 pt-6 border-t border-border-subtle">
                                <p className="text-fg-subtle text-sm">
                                    For any queries or concerns, please reach out to us at:
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-3 text-sm">
                                    <div className="flex items-center gap-2 text-fg-muted">
                                        <Phone className="w-4 h-4" />
                                        <span>+91 98798 57529</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-fg-muted">
                                        <Mail className="w-4 h-4" />
                                        <span>kiddosintellect@gmail.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Acknowledgment */}
                    <section className="card bg-surface-subtle border-2 border-border">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-3 xs:mb-3.5 sm:mb-4 md:mb-5">
                                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-brand" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-fg mb-3">Acknowledgment</h2>
                            <p className="text-fg-muted max-w-2xl mx-auto">
                                By placing an order with Kiddos Intallcat, you acknowledge that you have read, understood, and
                                agree to the terms of this No-Refund Policy. If you have any questions or need further clarification,
                                please contact our customer support team before making a purchase.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
            <ScrollToTopButton />
        </div>
    );
};

export default RefundPolicy;
