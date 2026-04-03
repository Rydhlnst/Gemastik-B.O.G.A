import React from 'react'
import { MainSection } from '@/components/MainSection'
import { FloatingSearchBar } from '@/components/FloatingSearchBar'

const GovermentPage = () => {
    return (
        <div className="relative pb-20">
            {/* Hero Main Section */}
            <MainSection />
            
            {/* Floating Search Bar (slightly overlaps the MainSection) */}
            <FloatingSearchBar />
        </div>
    )
}

export default GovermentPage