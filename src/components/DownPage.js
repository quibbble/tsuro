import React from "react";
import Footer from "./Footer";

export default function DownPage() {
    return (
        <div className="flex flex-col items-center my-8 md:my-12">
            <div className="w-full flex flex-col items-center mt-48">
                <p className="font-black text-4xl italic">We'll be right back!</p>
                <p className="mb-1 font-thin"><span className="title text-3xl font-black text-red-600 mr-1">Tsuro</span> is down for maintenance</p>
            </div>
            <div className="absolute bottom-8 md:bottom-12">
                <Footer />
            </div>
       </div>
    )
}
