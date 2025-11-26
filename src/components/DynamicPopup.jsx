// src/components/DynamicPopup.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/DynamicPopup.css';
import api from '../api/client';

const DynamicPopup = ({ page = 'all' }) => {
    const [popup, setPopup] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        checkAndFetchPopup();
    }, []);

    const checkAndFetchPopup = async () => {
        // Check session dismissal
        const sessionDismissed = sessionStorage.getItem('popupDismissed');
        if (sessionDismissed) return;

        // Check if user has seen popup today
        const lastShown = localStorage.getItem('popupLastShown');
        if (lastShown) {
            const lastDate = new Date(parseInt(lastShown));
            const now = new Date();
            if (now - lastDate < 24 * 60 * 60 * 1000) {
                // Shown within last 24 hours
                return;
            }
        }
        fetchPopupData();
    };

    const fetchPopupData = async () => {
        try {
            console.log('📡 Frontend: Fetching popup data...');

            // Determine user type
            const returningUser = localStorage.getItem('returning');
            const userType = returningUser ? 'returning' : 'new';

            if (!returningUser) {
                localStorage.setItem('returning', 'true');
            }

            console.log('🔗 Frontend: Making API request...');

            // Use the API client with proper error handling
            const response = await api.get(`/settings/popup/active`, {
                params: {
                    userType,
                    page
                }
            });

            console.log('📦 Frontend: API Response:', response);
            console.log('📦 Frontend: Response data:', response.data);

            if (response.data.ok && response.data.popup) {
                console.log('✅ Frontend: Popup found:', response.data.popup.title);
                setPopup(response.data.popup);
                setupTrigger(response.data.popup);
                await trackImpression(response.data.popup._id);
            } else {
                console.log('ℹ️ Frontend: No active popup found in response');
            }
        } catch (error) {
            console.error('❌ Frontend: Error fetching popup:', error);
            console.error('❌ Frontend: Error details:', error.response?.data);
        }
    };

    const setupTrigger = (popupData) => {
        if (hasShown) return;

        switch (popupData.triggerType) {
            case 'time':
                setTimeout(() => {
                    setIsVisible(true);
                    setHasShown(true);
                }, popupData.triggerValue * 1000);
                break;

            case 'scroll':
                const handleScroll = () => {
                    const scrollPercent =
                        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

                    if (scrollPercent >= popupData.triggerValue && !hasShown) {
                        setIsVisible(true);
                        setHasShown(true);
                        window.removeEventListener('scroll', handleScroll);
                    }
                };
                window.addEventListener('scroll', handleScroll);
                break;

            case 'exit':
                const handleMouseLeave = (e) => {
                    if (e.clientY <= 0 && !hasShown) {
                        setIsVisible(true);
                        setHasShown(true);
                        document.removeEventListener('mouseleave', handleMouseLeave);
                    }
                };
                document.addEventListener('mouseleave', handleMouseLeave);
                break;

            default:
                setIsVisible(true);
                setHasShown(true);
        }
    };

    const trackImpression = async (configId) => {
        await fetch(`/api/settings/popup/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configId, action: 'impression' })
        });
    };

    const handleClose = async () => {
        setIsVisible(false);

        // Track dismissal
        if (popup?._id) {
            await fetch(`/api/settings/popup/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ configId: popup._id, action: 'dismiss' })
            });
        }

        // Respect frequency settings
        if (popup?.showOncePerSession) {
            sessionStorage.setItem('popupDismissed', 'true');
        }

        if (popup?.showOncePerDay) {
            localStorage.setItem('popupLastShown', Date.now().toString());
        }
    };

    const handleCTA = async () => {
        if (popup?._id) {
            await fetch(`/api/settings/popup/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ configId: popup._id, action: 'click' })
            });
        }

        const link = popup.ctaLink || (popup.product ? `/product/${popup.product.slug}` : '/catalog');
        window.location.href = link;
    };

    if (!popup || !isVisible) return null;

    // IMAGE-BASED POPUP
    if (popup.designType === 'image' && popup.imageUrl) {
        const design = popup.customDesign || {};

        return (
            <>
                <div
                    className="popup-overlay"
                    onClick={handleClose}
                    style={{
                        backgroundColor: design.overlayColor || 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: design.overlayBlur || 'blur(4px)'
                    }}
                />
                <div
                    className="popup-container popup-image-mode"
                    style={{
                        animation: `${design.animationType || 'slideUp'} ${design.animationDuration || '400ms'} ease-out`,
                        maxWidth: design.maxWidth || '800px',
                        borderRadius: design.borderRadius || '16px'
                    }}
                >
                    <button
                        className="popup-close"
                        onClick={handleClose}
                        aria-label="Close popup"
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white'
                        }}
                    >
                        <X size={24} />
                    </button>

                    <img
                        src={popup.imageUrl}
                        alt={popup.title}
                        className="popup-full-image"
                        onClick={popup.ctaLink ? handleCTA : undefined}
                        style={{ cursor: popup.ctaLink ? 'pointer' : 'default' }}
                    />
                </div>
            </>
        );
    }

    // CUSTOM DESIGN POPUP
    const product = popup.product;
    const design = popup.customDesign || {};

    // Calculate discounted price
    const originalPrice = product?.price || 0;
    const discount = popup.discountPercentage || product?.discountPct || 0;
    const finalPrice = originalPrice - (originalPrice * discount / 100);

    return (
        <>
            <div
                className="popup-overlay"
                onClick={handleClose}
                style={{
                    backgroundColor: design.overlayColor || 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: design.overlayBlur ? `blur(${design.overlayBlur})` : 'blur(4px)'
                }}
            />
            <div
                className={`popup-container popup-layout-${design.layout || 'left-right'}`}
                style={{
                    backgroundColor: design.backgroundColor || '#ffffff',
                    borderRadius: design.borderRadius || '16px',
                    padding: design.padding || '32px',
                    maxWidth: design.maxWidth || '600px',
                    fontFamily: design.fontFamily || 'system-ui',
                    color: design.textColor || '#000000',
                    animation: `${design.animationType || 'slideUp'} ${design.animationDuration || '400ms'} cubic-bezier(0.16, 1, 0.3, 1)`
                }}
            >
                <button
                    className="popup-close"
                    onClick={handleClose}
                    aria-label="Close popup"
                >
                    <X size={24} />
                </button>

                <div className="popup-content">
                    {/* Product Image */}
                    {design.showProductImage && product?.assets?.coverUrl?.[0] && (
                        <div
                            className={`popup-image popup-image-${design.imagePosition || 'left'}`}
                            style={{
                                width: design.imageSize || '50%',
                                order: design.imagePosition === 'right' ? 2 : 0
                            }}
                        >
                            <img
                                src={product.assets.coverUrl[0]}
                                alt={product.title}
                                loading="lazy"
                            />
                        </div>
                    )}

                    <div className="popup-details" style={{ flex: 1 }}>
                        {/* Discount Badge */}
                        {discount > 0 && (
                            <div
                                className="popup-badge"
                                style={{
                                    backgroundColor: design.accentColor || '#4F46E5',
                                    color: design.ctaTextColor || '#ffffff'
                                }}
                            >
                                {discount}% OFF
                            </div>
                        )}

                        {/* Title */}
                        <h2
                            className="popup-title"
                            style={{
                                fontSize: design.titleFontSize || '28px',
                                fontWeight: design.titleFontWeight || '700',
                                color: design.textColor || '#1a202c'
                            }}
                        >
                            {popup.title}
                        </h2>

                        {/* Description */}
                        {popup.description && (
                            <p
                                className="popup-description"
                                style={{
                                    fontSize: design.descriptionFontSize || '16px',
                                    color: design.textColor || '#4a5568'
                                }}
                            >
                                {popup.description}
                            </p>
                        )}

                        {/* Product Info */}
                        {product && (
                            <div className="popup-product">
                                <h3 style={{ color: design.textColor }}>{product.title}</h3>
                                <div className="popup-pricing">
                                    {discount > 0 ? (
                                        <>
                                            <span className="popup-original-price">₹{originalPrice}</span>
                                            <span
                                                className="popup-discounted-price"
                                                style={{ color: design.accentColor || '#48bb78' }}
                                            >
                                                ₹{finalPrice.toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <span
                                            className="popup-price"
                                            style={{ color: design.textColor }}
                                        >
                                            ₹{originalPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <button
                            className="popup-cta"
                            onClick={handleCTA}
                            style={{
                                backgroundColor: design.ctaBackgroundColor || '#4F46E5',
                                color: design.ctaTextColor || '#ffffff',
                                fontSize: design.ctaFontSize || '18px',
                                fontWeight: design.ctaFontWeight || '600',
                                borderRadius: design.ctaBorderRadius || '12px',
                                padding: design.ctaPadding || '16px 32px'
                            }}
                        >
                            {popup.ctaText || 'Shop Now'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DynamicPopup;
