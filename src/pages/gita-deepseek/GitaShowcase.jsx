import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const GitaCinematicScroll = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const gsapRef = useRef(null);
  const ScrollTriggerRef = useRef(null);

  // Book Refs
  const centerBookRef = useRef(null);
  const leftBookRef = useRef(null);
  const rightBookRef = useRef(null);

  // Content Refs
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);
  const leftContent2Ref = useRef(null);
  const rightContent2Ref = useRef(null);
  const leftContent3Ref = useRef(null);
  const rightContent3Ref = useRef(null);
  const leftContent4Ref = useRef(null);
  const rightContent4Ref = useRef(null);

  // Decorative elements
  const floatingSymbol1Ref = useRef(null);
  const floatingSymbol2Ref = useRef(null);

  // Load GSAP dynamically
  useEffect(() => {
    let mounted = true;

    const loadGsap = async () => {
      try {
        const [gsapModule, scrollTriggerModule] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger")
        ]);

        if (mounted) {
          gsapRef.current = gsapModule.default;
          ScrollTriggerRef.current = scrollTriggerModule.ScrollTrigger;
          gsapModule.default.registerPlugin(scrollTriggerModule.ScrollTrigger);
          setGsapLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load GSAP:", error);
      }
    };

    loadGsap();

    return () => {
      mounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!gsapLoaded || !gsapRef.current || !ScrollTriggerRef.current) return;

    const gsap = gsapRef.current;
    const ScrollTrigger = ScrollTriggerRef.current;

    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      // --- DESKTOP ANIMATION (Cinematic & Flowing) ---
      mm.add("(min-width: 768px)", () => {

        // 1. INITIAL SETUP
        gsap.set(centerBookRef.current, {
          scale: 1.3,
          top: '50%',
          yPercent: -50,
          rotation: 0
        });

        gsap.set([leftBookRef.current, rightBookRef.current], {
          autoAlpha: 0,
          scale: 0.9,
          yPercent: -50,
          top: '75%',
          y: 60
        });

        gsap.set([
          leftContentRef.current, rightContentRef.current,
          leftContent2Ref.current, rightContent2Ref.current,
          leftContent3Ref.current, rightContent3Ref.current,
          leftContent4Ref.current, rightContent4Ref.current
        ], { autoAlpha: 0, y: 30 });

        // Floating symbols
        gsap.set([floatingSymbol1Ref.current, floatingSymbol2Ref.current], {
          autoAlpha: 0,
          scale: 0.8
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: '+=800%',
            scrub: 1.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }
        });

        // --- PHASE 1: ATMOSPHERE ---
        // Keep headline visible longer, then fade slowly
        tl.to(textRef.current, {
          y: -100,
          autoAlpha: 0.08,
          duration: 3,
          ease: "power1.out"
        }, 1.5); // Start later so headline stays visible

        tl.to(centerBookRef.current, {
          scale: 1.25,
          rotation: -2,
          duration: 3,
          ease: "sine.inOut"
        }, 0);

        // Floating symbols appear subtly
        tl.to(floatingSymbol1Ref.current, {
          autoAlpha: 0.06,
          scale: 1,
          duration: 2,
          ease: "power1.out"
        }, 0.5);

        // --- SECTION 1: Values ---
        tl.addLabel("s1", "+=0.5");
        tl.to([leftContentRef.current, rightContentRef.current], {
          y: 0,
          autoAlpha: 1,
          duration: 2.5,
          ease: "power2.out"
        }, "s1");

        tl.to(centerBookRef.current, {
          rotation: 3,
          yPercent: -52,
          duration: 4,
          ease: "sine.inOut"
        }, "s1");

        // Subtle symbol movement
        tl.to(floatingSymbol1Ref.current, {
          y: -20,
          rotation: 5,
          duration: 4,
          ease: "sine.inOut"
        }, "s1");

        // --- SECTION 2: Challenges ---
        tl.addLabel("s2", ">-1");

        tl.to([leftContentRef.current, rightContentRef.current], {
          y: -40,
          autoAlpha: 0,
          duration: 2.5
        }, "s2");

        tl.to([leftContent2Ref.current, rightContent2Ref.current], {
          y: 0,
          autoAlpha: 1,
          duration: 2.5
        }, "s2+=0.5");

        tl.to(centerBookRef.current, {
          rotation: -2,
          scale: 1.22,
          yPercent: -48,
          duration: 4,
          ease: "sine.inOut"
        }, "s2");

        // Swap floating symbols
        tl.to(floatingSymbol1Ref.current, {
          autoAlpha: 0,
          scale: 0.8,
          duration: 2
        }, "s2");

        tl.to(floatingSymbol2Ref.current, {
          autoAlpha: 0.06,
          scale: 1,
          duration: 2
        }, "s2+=0.5");

        // --- SECTION 3: Growth ---
        tl.addLabel("s3", ">-1");

        tl.to([leftContent2Ref.current, rightContent2Ref.current], {
          y: -40,
          autoAlpha: 0,
          duration: 2.5
        }, "s3");

        tl.to([leftContent3Ref.current, rightContent3Ref.current], {
          y: 0,
          autoAlpha: 1,
          duration: 2.5
        }, "s3+=0.5");

        tl.to(centerBookRef.current, {
          rotation: 1,
          scale: 1.2,
          duration: 4,
          ease: "power1.inOut"
        }, "s3");

        tl.to(floatingSymbol2Ref.current, {
          y: 20,
          rotation: -5,
          duration: 4,
          ease: "sine.inOut"
        }, "s3");

        // --- SECTION 4: Why Now ---
        tl.addLabel("s4", ">-1");

        tl.to([leftContent3Ref.current, rightContent3Ref.current], {
          y: -40,
          autoAlpha: 0,
          duration: 2.5
        }, "s4");

        tl.to([leftContent4Ref.current, rightContent4Ref.current], {
          y: 0,
          autoAlpha: 1,
          duration: 2.5
        }, "s4+=0.5");

        tl.to(centerBookRef.current, {
          rotation: 0,
          scale: 1.15,
          duration: 4,
          ease: "power1.inOut"
        }, "s4");

        // --- PHASE 3: THE GLIDE (Cinematic Transition) ---
        tl.addLabel("glide", ">=2");

        // Fade out floating symbols
        tl.to([floatingSymbol1Ref.current, floatingSymbol2Ref.current], {
          autoAlpha: 0,
          duration: 2
        }, "glide");

        // Center Book Glides Down
        tl.to(centerBookRef.current, {
          top: '75%',
          scale: 0.9,
          yPercent: -50,
          rotation: 0,
          duration: 6,
          ease: "power1.inOut"
        }, "glide");

        // Fade out Section 4
        tl.to([leftContent4Ref.current, rightContent4Ref.current], {
          y: -30,
          autoAlpha: 0,
          duration: 3
        }, "glide");

        // Side Books Reveal
        tl.to([leftBookRef.current, rightBookRef.current], {
          autoAlpha: 1,
          y: 0,
          duration: 4,
          ease: "power2.out"
        }, "glide+=2");

        // Bring back subtle background
        tl.to(textRef.current, {
          autoAlpha: 0.04,
          y: -80,
          duration: 2
        }, "glide+=4");

        // Final hold
        tl.to({}, { duration: 2.5 });

      });

      // --- MOBILE SETUP ---
      mm.add("(max-width: 767px)", () => {
        gsap.set([centerBookRef.current, leftBookRef.current, rightBookRef.current], { clearProps: "all" });
        gsap.set(textRef.current, { autoAlpha: 1 });
        gsap.set([
          leftContentRef.current, rightContentRef.current,
          leftContent2Ref.current, rightContent2Ref.current,
          leftContent3Ref.current, rightContent3Ref.current,
          leftContent4Ref.current, rightContent4Ref.current
        ], { autoAlpha: 1, y: 0 });
      });

    }, containerRef);

    return () => ctx.revert();
  }, [gsapLoaded]);

  const handleImageLoad = () => {
    if (ScrollTriggerRef.current) {
      ScrollTriggerRef.current.refresh();
    }
  };

  return (
    <MainContainer ref={containerRef}>

      {/* Background Decor */}
      <BackgroundSymbols>
        <Symbol style={{ top: '15%', left: '8%', fontSize: '4rem', opacity: 0.03 }}>ॐ</Symbol>
        <Symbol style={{ top: '25%', right: '12%', fontSize: '3rem', opacity: 0.04 }}>🕉️</Symbol>
        <Symbol style={{ bottom: '20%', left: '10%', fontSize: '3.5rem', opacity: 0.03 }}>☸</Symbol>
        <Symbol style={{ top: '60%', right: '15%', fontSize: '2.5rem', opacity: 0.04 }}>🪷</Symbol>
        <Symbol style={{ top: '40%', left: '5%', fontSize: '2rem', opacity: 0.025 }}>✦</Symbol>
        <Symbol style={{ bottom: '30%', right: '8%', fontSize: '2.5rem', opacity: 0.03 }}>❈</Symbol>
      </BackgroundSymbols>

      {/* Floating Decorative Symbols */}
      <FloatingSymbol ref={floatingSymbol1Ref} style={{ top: '35%', left: '25%' }}>
        ॐ
      </FloatingSymbol>
      <FloatingSymbol ref={floatingSymbol2Ref} style={{ top: '45%', right: '22%' }}>
        ☸
      </FloatingSymbol>

      <BackgroundTextContainer ref={textRef}>
        <HeadlineLine>TIMELESS</HeadlineLine>
        <HeadlineLine>WISDOM</HeadlineLine>
      </BackgroundTextContainer>

      <ContentGrid>
        {/* SECTION 1: When They Ask Why */}
        <SidePanel ref={leftContentRef} $align="flex-end" $textAlign="right" $orderMobile="2">
          <SectionLabel>When They Ask "Why?"</SectionLabel>
          <Description>
            "Why should I share my toys?" "What if someone is mean to me?" These aren't just questions—they're moments that shape character. Give your child answers rooted in 5,000 years of wisdom, told through stories they'll actually remember.
          </Description>
        </SidePanel>
        <SidePanel ref={rightContentRef} $align="flex-start" $textAlign="left" $orderMobile="3">
          <MetaItem><MetaNumber>truth</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>kindness</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>courage</MetaNumber></MetaItem>
        </SidePanel>

        {/* SECTION 2: Modern Challenges */}
        <SidePanel ref={leftContent2Ref} $align="flex-end" $textAlign="right" $orderMobile="4">
          <SectionLabel>Ancient Wisdom, Modern Challenges</SectionLabel>
          <Description>
            Test anxiety. Peer pressure. Big emotions they can't name yet. The Gita speaks to all of it—not with rules, but with stories of brave warriors who learned that real strength comes from a calm mind and a kind heart.
          </Description>
        </SidePanel>
        <SidePanel ref={rightContent2Ref} $align="flex-start" $textAlign="left" $orderMobile="5">
          <MetaItem><MetaNumber>calm</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>focus</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>balance</MetaNumber></MetaItem>
        </SidePanel>

        {/* SECTION 3: Growing Together */}
        <SidePanel ref={leftContent3Ref} $align="flex-end" $textAlign="right" $orderMobile="6">
          <SectionLabel>A Book That Grows With Them</SectionLabel>
          <Description>
            Perfect for ages 6-12, with layers of meaning that deepen as they do. Read it together at bedtime. Discuss it over breakfast. Watch as ancient teachings become their compass for navigating friendships, failures, and everything in between.
          </Description>
        </SidePanel>
        <SidePanel ref={rightContent3Ref} $align="flex-start" $textAlign="left" $orderMobile="7">
          <MetaItem><MetaNumber>wisdom</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>connection</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>growth</MetaNumber></MetaItem>
        </SidePanel>

        {/* SECTION 4: Why Now */}
        <SidePanel ref={leftContent4Ref} $align="flex-end" $textAlign="right" $orderMobile="8">
          <SectionLabel>In a World of Screens and Scrolls</SectionLabel>
          <Description>
            While algorithms compete for your child's attention, give them something that anchors their soul. Stories that don't just entertain for 5 minutes, but shape who they become for 50 years. This isn't just another book—it's a compass for life.
          </Description>
          <Link to="/catalog"><CtaButton>Get Your Copy</CtaButton></Link>
        </SidePanel>
        <SidePanel ref={rightContent4Ref} $align="flex-start" $textAlign="left" $orderMobile="9">
          <MetaItem><MetaNumber>anchor</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>legacy</MetaNumber></MetaItem>
          <Divider />
          <MetaItem><MetaNumber>timeless</MetaNumber></MetaItem>
        </SidePanel>

        <Spacer />
      </ContentGrid>

      {/* BOOK LAYER */}
      <BookWrapper>
        <Link to="/catalog">
          <SideBook
            ref={leftBookRef}
            src="/images-webp/HindiGita3D.webp"
            $position="left"
            alt="Bhagavad Gita Hindi Edition"
            onError={(e) => { e.target.src = "https://placehold.co/420x580/e8e6d8/1a4d3e?text=Hindi+Edition"; }}
          />
        </Link>
        <Link to="/catalog">
          <CenterBook
            ref={centerBookRef}
            src="/images-webp/EnglishGita3D.webp"
            alt="Bhagavad Gita for Children"
            onLoad={handleImageLoad}
            onError={(e) => { e.target.src = "https://placehold.co/450x600/f7f5eb/1a4d3e?text=Gita+for+Kids"; }}
          /></Link>
        <Link to="/catalog">
          <SideBook
            ref={rightBookRef}
            src="/images-webp/GujratiGita3D.webp"
            $position="right"
            alt="Bhagavad Gita Gujarati Edition"
            onError={(e) => { e.target.src = "https://placehold.co/420x580/e8e6d8/1a4d3e?text=Gujarati+Edition"; }}
          />
        </Link>
      </BookWrapper>

    </MainContainer>
  );
};

export default GitaCinematicScroll;

// --- STYLED COMPONENTS ---

const MainContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh; 
  background-color: #f7f5eb;
  overflow: hidden; 
  
  @media (max-width: 767px) { 
    height: auto; 
    overflow: visible; 
    padding: 40px 0 80px 0; 
  }
  
  @media (min-width: 1920px) {
    max-width: 2560px;
    margin: 0 auto;
  }
`;

const BackgroundSymbols = styled.div`
  position: absolute; 
  inset: 0; 
  pointer-events: none;
  z-index: 0;
  
  @media (max-width: 767px) { 
    display: none; 
  }
`;

const Symbol = styled.div`
  position: absolute; 
  color: #1a4d3e; 
  pointer-events: none;
  user-select: none;
`;

const FloatingSymbol = styled.div`
  position: absolute;
  font-size: 5rem;
  color: #1a4d3e;
  pointer-events: none;
  user-select: none;
  opacity: 0;
  z-index: 3;
  will-change: transform, opacity;
  
  @media (max-width: 767px) { 
    display: none; 
  }
`;

const BackgroundTextContainer = styled.div`
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%);
  text-align: center; 
  width: 100%; 
  pointer-events: none;
  z-index: 1;
  
  @media (max-width: 767px) { 
    position: relative; 
    top: auto; 
    left: auto; 
    transform: none; 
    padding: 20px 16px 10px 16px;
    margin-bottom: 20px;
  }
`;

const HeadlineLine = styled.h1`
  font-family: 'Playfair Display', serif; 
  font-size: clamp(60px, 15vw, 220px);
  color: #1f3d32; 
  line-height: 0.9; 
  margin: 0; 
  text-transform: uppercase;
  letter-spacing: -0.02em;
  font-weight: 400;
  opacity: 1; /* Start fully visible */
  
  @media (max-width: 767px) {
    font-size: clamp(36px, 12vw, 56px);
    line-height: 1;
    opacity: 1;
    letter-spacing: -0.01em;
  }
`;

const ContentGrid = styled.div`
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  display: grid; 
  grid-template-columns: 1fr minmax(300px, 30vw) 1fr;
  align-items: center; 
  padding: 0 4vw; 
  max-width: 2560px; 
  margin: 0 auto; 
  pointer-events: none;
  z-index: 5;
  
  @media (max-width: 767px) { 
    position: relative; 
    display: flex; 
    flex-direction: column; 
    height: auto; 
    padding: 0 20px; 
    gap: 40px; 
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    padding: 0 3vw;
    grid-template-columns: 1fr minmax(280px, 35vw) 1fr;
  }
`;

const Spacer = styled.div`
  grid-column: 2; 
  grid-row: 1; 
  pointer-events: none;
  
  @media (max-width: 767px) { 
    display: none; 
  }
`;

const SidePanel = styled.div`
  position: absolute; 
  display: flex; 
  flex-direction: column; 
  justify-content: center;
  align-items: ${props => props.$align}; 
  text-align: ${props => props.$textAlign}; 
  gap: 20px;
  opacity: 0; 
  visibility: hidden; 
  pointer-events: auto;
  will-change: transform, opacity;
  
  ${props => props.$align === 'flex-end' && props.$textAlign === 'right' && `
    right: calc(50% + 18vw); 
    @media (max-width: 1440px) { right: calc(50% + 220px); }
    @media (min-width: 768px) and (max-width: 1024px) { right: calc(50% + 200px); }
  `}
  
  ${props => props.$align === 'flex-start' && props.$textAlign === 'left' && `
    left: calc(50% + 18vw);
    @media (max-width: 1440px) { left: calc(50% + 220px); }
    @media (min-width: 768px) and (max-width: 1024px) { left: calc(50% + 200px); }
  `}

  @media (max-width: 767px) {
    position: relative; 
    right: auto !important; 
    left: auto !important;
    opacity: 1 !important; 
    visibility: visible !important;
    align-items: center; 
    text-align: center; 
    order: ${props => props.$orderMobile};
    padding: 16px 0;
    gap: 16px;
    
    ${props => props.$textAlign === 'left' && `display: none;`}
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    gap: 18px;
  }
`;

const SectionLabel = styled.span`
  font-family: 'Inter', sans-serif; 
  font-size: 0.8rem; 
  font-weight: 600; 
  letter-spacing: 2px;
  text-transform: uppercase; 
  color: #1a4d3e; 
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(26, 77, 62, 0.2);
  display: inline-block;
  
  @media (max-width: 767px) {
    font-size: 0.7rem;
    letter-spacing: 1.5px;
    padding-bottom: 6px;
  }
`;

const Description = styled.p`
  font-family: 'Inter', sans-serif; 
  font-size: 1.15rem; 
  color: #2c3e35; 
  line-height: 1.6; 
  max-width: 400px;
  margin: 0;
  font-weight: 300;
  
  @media (max-width: 767px) {
    font-size: 0.95rem;
    line-height: 1.55;
    max-width: 100%;
  }
  
  @media (min-width: 768px) and (max-width: 1024px) { 
    font-size: 1rem; 
    max-width: 320px; 
  }
  
  @media (min-width: 1440px) {
    font-size: 1.2rem;
    max-width: 450px;
  }
`;

const CtaButton = styled.button`
  background: transparent; 
  color: #1a4d3e; 
  border: 1px solid #1a4d3e; 
  border-radius: 50px;
  padding: 14px 40px; 
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  text-transform: uppercase; 
  letter-spacing: 1px;
  cursor: pointer; 
  transition: all 0.3s ease;
  margin-top: 8px;
  align-self: center;
  
  &:hover { 
    background: #1a4d3e; 
    color: #f7f5eb; 
    transform: translateY(-2px);
  }
  
  @media (max-width: 767px) {
    padding: 12px 32px;
    font-size: 0.8rem;
    margin-top: 6px;
  }
`;

const MetaItem = styled.div` 
  display: flex; 
  flex-direction: column; 
`;

const MetaNumber = styled.span` 
  font-family: 'Playfair Display', serif; 
  font-size: 2.2rem; 
  color: #1a4d3e; 
  line-height: 1;
  font-style: italic; 
  
  @media (min-width: 768px) and (max-width: 1024px) {
    font-size: 1.8rem;
  }
  
  @media (min-width: 1440px) {
    font-size: 2.4rem;
  }
`;

const Divider = styled.div`
  width: 40px;
  height: 1px;
  background-color: rgba(26, 77, 62, 0.15);
  margin: 16px 0;
  
  @media (min-width: 768px) and (max-width: 1024px) {
    margin: 14px 0;
  }
`;

const BookWrapper = styled.div`
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  z-index: 10; 
  pointer-events: none;
  
  @media (max-width: 767px) {
    position: relative; 
    height: auto; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    gap: 30px; 
    margin: 40px 0;
  }
`;

const BaseBookImg = styled.img`
  display: block; 
  position: absolute;
  filter: drop-shadow(10px 20px 30px rgba(26, 77, 62, 0.2));
  will-change: transform, top, opacity;
  
  @media (max-width: 767px) {
    position: relative; 
    top: auto !important; 
    left: auto !important; 
    transform: none !important; 
    width: 240px;
    filter: drop-shadow(8px 16px 24px rgba(26, 77, 62, 0.15));
  }
`;

const CenterBook = styled(BaseBookImg)`
  width: clamp(280px, 28vw, 520px);
  left: 50%; 
  transform: translate(-50%, -50%);
  
  @media (min-width: 768px) and (max-width: 1024px) {
    width: clamp(300px, 32vw, 400px);
  }
  
  @media (min-width: 1440px) {
    width: clamp(400px, 26vw, 550px);
  }
`;

const SideBook = styled(BaseBookImg)`
  width: clamp(220px, 22vw, 420px);
  opacity: 0;
  ${props => props.$position === 'left' ? 'left: 15%;' : 'right: 15%;'}
  top: 75%; 
  transform: translate(0, -50%);
  
  @media (max-width: 767px) {
    opacity: 1; 
    width: 220px;
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    width: clamp(200px, 24vw, 340px);
    ${props => props.$position === 'left' ? 'left: 10%;' : 'right: 10%;'}
  }
  
  @media (min-width: 1440px) {
    width: clamp(300px, 20vw, 450px);
    ${props => props.$position === 'left' ? 'left: 18%;' : 'right: 18%;'}
  }
`;