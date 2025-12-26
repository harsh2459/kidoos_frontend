import React from 'react'
import HeroVrindavan from './HeroVrindavan'
import VisionMissionValues from './VisionMissionValues'
import SacredFlowSection from './SacredFlowSection'
import BookShowcaseDark from './BookShowcaseDark'

const Hero = () => {
    return (
       <main className="w-full bg-[#0a0503]">
            {/* All sections now share same dark background for seamless flow */}
            <HeroVrindavan />
            <VisionMissionValues />
            <SacredFlowSection/> 
            <BookShowcaseDark />
        </main>
    )
}

export default Hero
