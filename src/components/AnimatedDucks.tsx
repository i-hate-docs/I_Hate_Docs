"use client";

import { motion, useAnimation, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export type DuckState = "idle" | "tracking" | "hiding" | "gasping" | "cheering" | "judging";

interface AnimatedDucksProps {
  state: DuckState;
  caretPosition: { x: number; y: number }; // x, y offset for tracking
  typingSpeed: number; // 0 to 1 (affects black duck peeking)
  isValid: boolean | null; // For tracking state (happy/confused)
}

// Custom bouncy easing
const bounceTransition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
  mass: 1,
};

// ─── Individual Duck Component ─────────────────────────────────────
interface DuckProps {
  color: "yellow" | "orange" | "black";
  state: DuckState;
  caretPosition: { x: number; y: number };
  typingSpeed: number;
  isValid: boolean | null;
  index: number;
}

function DuckCharacter({ color, state, caretPosition, typingSpeed, isValid, index }: DuckProps) {
  // Colors based on duck type
  const isYellow = color === "yellow";
  const isOrange = color === "orange";
  const isBlack = color === "black";

  const bodyColor = isYellow ? "#FFD400" : isOrange ? "#FF8A00" : "#1A1A1A";
  const bellyColor = isYellow ? "#FFE866" : isOrange ? "#FFB04D" : "#333333";
  const beakColor = isYellow || isOrange ? "#FF6A00" : "#FF9A00";
  const eyeColor = isBlack ? "#FFD400" : "#111111"; // Black duck has glowing yellow eyes
  
  const headControls = useAnimation();
  const eyeControls = useAnimation();
  const wingLeftControls = useAnimation();
  const wingRightControls = useAnimation();
  const bodyControls = useAnimation();
  const bodyY = useMotionValue(0);

  // Mouse tracking values (smoothed)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  
  const eyeLookX = useTransform(smoothX, [-300, 300], [-8, 8]);
  const eyeLookY = useTransform(smoothY, [-300, 300], [-8, 8]);
  const headLookX = useTransform(smoothX, [-300, 300], [-10, 10]);
  const headLookY = useTransform(smoothY, [-300, 300], [-5, 5]);

  // Shadow transform driven by bodyY
  const shadowScale = useTransform(bodyY, [-30, 0], [0.5, 1]);

  // Idle animation loop
  useEffect(() => {
    let isActive = true;
    const idleLoop = async () => {
      while (isActive && state === "idle") {
        // Random blink
        if (Math.random() > 0.6) {
           eyeControls.start({ scaleY: [1, 0.1, 1], transition: { duration: 0.15 } });
        }
        // Breathing
        bodyControls.start({ scaleY: [1, 1.02, 1], scaleX: [1, 0.98, 1], transition: { duration: 2, ease: "easeInOut" } });
        // Head bob/tilt
        const tilt = (Math.random() - 0.5) * 10;
        headControls.start({ rotate: tilt, transition: { duration: 1.5, ease: "easeInOut" } });
        
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
      }
    };
    idleLoop();
    return () => { isActive = false; };
  }, [state, eyeControls, bodyControls, headControls]);

  // Global mouse tracking for idle state
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (state === "idle") {
        // Calculate offset from center of screen (approx)
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        mouseX.set(e.clientX - cx);
        mouseY.set(e.clientY - cy);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [state, mouseX, mouseY]);

  const prevState = useRef<DuckState | null>(null);

  // State-based Animation Logic
  useEffect(() => {
    const isNewState = prevState.current !== state;
    prevState.current = state;

    if (state === "tracking") {
      // Look at caret
      mouseX.set(caretPosition.x * 200); // Amplify caret movement
      mouseY.set(caretPosition.y * 50);
      
      if (isNewState) {
        headControls.start({ rotate: 0, scale: 1, transition: bounceTransition });
        bodyControls.start({ scaleX: 1, scaleY: 1, transition: bounceTransition });
      }
      
      // Happy or confused based on valid state
      if (isValid === true) {
         // Happy squint
         eyeControls.start({ scaleY: 0.6, borderRadius: ["50%", "50% 10% 10% 50%"] });
         wingLeftControls.start({ rotate: -20, y: -5 });
         wingRightControls.start({ rotate: 20, y: -5 });
      } else if (isValid === false) {
         // Confused tilt
         headControls.start({ rotate: index === 1 ? -15 : 15 });
         eyeControls.start({ scaleY: 1, scaleX: [1, 0.8, 1], transition: { repeat: Infinity, duration: 1 } });
      } else {
         // Normal tracking
         eyeControls.start({ scaleY: 1, scaleX: 1, borderRadius: "50%" });
         wingLeftControls.start({ rotate: 0, y: 0 });
         wingRightControls.start({ rotate: 0, y: 0 });
      }

    } else if (state === "hiding") {
      // Cover eyes!
      mouseX.set(0); mouseY.set(0);
      
      if (isBlack) {
        // Black duck peeks based on typing speed
        const peekAmount = Math.min(1, typingSpeed * 1.5); // 0 to 1
        
        const peekTransition = { type: "tween", ease: "easeOut", duration: 0.15 };
        
        // Head sneaks out to the side to peek from behind the wings
        headControls.start({ 
          rotate: -25 + (peekAmount * 20), // Tilt away, but tilt back towards center to peek
          x: -10 + (peekAmount * 18), // Slide sideways out of the wing's cover
          transition: isNewState ? bounceTransition : peekTransition
        });
        
        // Wings stay completely still covering the face!
        if (isNewState) {
          wingLeftControls.start({ 
            rotate: 130, 
            x: 22, 
            y: -42,
            transition: bounceTransition 
          });
          wingRightControls.start({ 
            rotate: -130, x: -22, y: -42, 
            transition: bounceTransition 
          });
        }
        
        // Squint eyes for sneaky look
        eyeControls.start({ 
           scaleY: 0.4 + (peekAmount * 0.4),
           scaleX: 0.8,
           x: peekAmount * 5,
           transition: { duration: 0.2 }
        });

      } else {
        // Yellow & Orange fully cover eyes
        if (isNewState) {
          // Turn away
          const turnDir = isYellow ? -25 : 25;
          headControls.start({ rotate: turnDir, x: isYellow ? -15 : 15, transition: bounceTransition });
          
          // Wings up
          wingLeftControls.start({ rotate: 130, x: 25, y: -45, transition: bounceTransition });
          wingRightControls.start({ rotate: -130, x: -25, y: -45, transition: bounceTransition });
          
          // Close eyes tightly
          eyeControls.start({ scaleY: 0.1, transition: { duration: 0.1 } });
        }
      }

    } else if (state === "gasping") {
      if (isNewState) {
        // Show password gasped!
        mouseX.set(0); mouseY.set(0);
        
        // Squash and stretch up
        bodyControls.start({ scaleY: 1.1, scaleX: 0.9, y: -10, transition: bounceTransition });
        headControls.start({ rotate: 0, y: -15, transition: bounceTransition });
        
        // Wide eyes
        eyeControls.start({ scaleY: 1.3, scaleX: 1.3, borderRadius: "50%", transition: bounceTransition });
        
        // Wings flare out
        wingLeftControls.start({ rotate: -45, x: -10, y: -10, transition: bounceTransition });
        wingRightControls.start({ rotate: 45, x: 10, y: -10, transition: bounceTransition });
      }

    } else if (state === "cheering") {
      if (isNewState) {
        // Success!
        bodyControls.start({ y: [0, -30, 0], transition: { duration: 0.5, repeat: 3 } });
        wingLeftControls.start({ rotate: [-20, -150, -20], transition: { duration: 0.4, repeat: Infinity } });
        wingRightControls.start({ rotate: [20, 150, 20], transition: { duration: 0.4, repeat: Infinity } });
        eyeControls.start({ scaleY: 0.2, borderRadius: "50% 50% 0 0" }); // Happy eyes
        headControls.start({ rotate: [0, -10, 10, 0], transition: { duration: 0.5, repeat: Infinity } });
      }

    } else if (state === "judging") {
      if (isNewState) {
        // Wrong password
        headControls.start({ rotate: 0, x: 0, y: 0 });
        eyeControls.start({ scaleY: 0.5, scaleX: 0.9, y: 2 }); // Half-lidded judging eyes
        wingLeftControls.start({ rotate: 20, x: 10, y: 10 }); // Arms crossed (approx)
        wingRightControls.start({ rotate: -20, x: -10, y: 10 });
      }
    }
    
    // Reset defaults when returning to idle
    if (state === "idle" && isNewState) {
       wingLeftControls.start({ rotate: 0, x: 0, y: 0, transition: bounceTransition });
       wingRightControls.start({ rotate: 0, x: 0, y: 0, transition: bounceTransition });
       eyeControls.start({ scaleY: 1, scaleX: 1, borderRadius: "50%", x: 0, y: 0 });
       headControls.start({ x: 0, y: 0 });
       bodyControls.start({ y: 0 });
    }

  }, [state, caretPosition, typingSpeed, isValid, isBlack, isYellow, isOrange, index, headControls, eyeControls, wingLeftControls, wingRightControls, bodyControls, mouseX, mouseY]);

  return (
    <motion.div 
      className="relative flex flex-col items-center justify-end"
      style={{ width: 140, height: 180 }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, ...bounceTransition }}
    >
      {/* Shadow */}
      <motion.div 
        className="absolute -bottom-2 h-4 w-24 rounded-[100%] bg-black/20 blur-sm origin-center"
        style={{ scaleX: shadowScale, scaleY: shadowScale }} 
      />

      {/* Body Container (Squash & Stretch) */}
      <motion.div className="relative flex flex-col items-center" animate={bodyControls} style={{ y: bodyY }}>
        
        {/* Head Tracking Wrapper */}
        <motion.div 
          className="relative z-20 flex flex-col items-center"
          style={{ x: headLookX, y: headLookY, originY: 1 }} 
        >
          {/* Head Animator */}
          <motion.div 
            className="relative flex flex-col items-center w-full h-full"
            animate={headControls}
            style={{ originY: 1 }}
          >
          {/* Main Head Shape */}
          <div 
            className="h-24 w-28 rounded-[50px] shadow-sm relative overflow-hidden"
            style={{ backgroundColor: bodyColor, boxShadow: "inset -4px -8px 12px rgba(0,0,0,0.15)" }}
          >
             {/* Cheek blushes for yellow/orange */}
             {!isBlack && (
               <>
                 <div className="absolute left-3 top-12 h-4 w-6 rounded-full bg-red-500/20 blur-[2px]" />
                 <div className="absolute right-3 top-12 h-4 w-6 rounded-full bg-red-500/20 blur-[2px]" />
               </>
             )}
          </div>

          {/* Eyes Container */}
          <div className="absolute top-8 flex w-16 justify-between z-30">
            {/* Left Eye */}
            <motion.div 
              className="flex h-5 w-5 items-center justify-center rounded-full overflow-hidden"
              style={{ backgroundColor: isBlack ? "#222" : "#fff" }} // White sclera for normal, dark for black duck
            >
              <motion.div 
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: eyeColor, x: eyeLookX, y: eyeLookY }}
                animate={eyeControls}
              />
            </motion.div>
            
            {/* Right Eye */}
            <motion.div 
              className="flex h-5 w-5 items-center justify-center rounded-full overflow-hidden"
              style={{ backgroundColor: isBlack ? "#222" : "#fff" }}
            >
              <motion.div 
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: eyeColor, x: eyeLookX, y: eyeLookY }}
                animate={eyeControls}
              />
            </motion.div>
          </div>

          {/* Beak */}
          <motion.div 
            className="absolute top-14 z-40 flex flex-col items-center"
            style={{ x: eyeLookX, y: eyeLookY }} // Beak moves slightly with eyes for 3D effect
            animate={state === "gasping" ? { y: 5, scaleY: 1.5 } : { y: 0, scaleY: 1 }}
          >
            {/* Top Beak */}
            <div 
              className="h-6 w-12 rounded-t-[12px] rounded-b-[4px]"
              style={{ backgroundColor: beakColor, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            />
            {/* Bottom Beak (opens during gasp) */}
            <motion.div 
              className="h-3 w-8 rounded-b-[8px]"
              style={{ backgroundColor: beakColor, filter: "brightness(0.8)" }}
              animate={state === "gasping" ? { rotateX: 60, y: 4 } : { rotateX: 0, y: -2 }}
            />
          </motion.div>
          </motion.div>
        </motion.div>

        {/* Body */}
        <div className="relative -mt-6 z-10">
           {/* Main Body */}
           <div 
             className="h-28 w-32 rounded-[60px] shadow-md relative overflow-hidden"
             style={{ backgroundColor: bodyColor, boxShadow: "inset -6px -12px 16px rgba(0,0,0,0.2)" }}
           >
              {/* Belly */}
              <div 
                className="absolute bottom-0 left-1/2 h-20 w-24 -translate-x-1/2 rounded-t-[50px] opacity-80"
                style={{ backgroundColor: bellyColor }}
              />
           </div>

           {/* Left Wing */}
           <motion.div 
             className="absolute -left-4 top-8 h-16 w-8 rounded-[20px]"
             style={{ backgroundColor: bodyColor, originX: 1, originY: 0, boxShadow: "inset -2px -4px 6px rgba(0,0,0,0.1)" }}
             animate={wingLeftControls}
           />
           
           {/* Right Wing */}
           <motion.div 
             className="absolute -right-4 top-8 h-16 w-8 rounded-[20px]"
             style={{ backgroundColor: bodyColor, originX: 0, originY: 0, boxShadow: "inset 2px -4px 6px rgba(0,0,0,0.1)" }}
             animate={wingRightControls}
           />
        </div>

      </motion.div>
    </motion.div>
  );
}


// ─── Main Container ──────────────────────────────────────────────
export function AnimatedDucks({ state, caretPosition, typingSpeed, isValid }: AnimatedDucksProps) {
  return (
    <div className="relative flex items-end justify-center gap-2 h-[220px] w-full max-w-[500px]">
      {/* Duck 1: Yellow (Energetic) */}
      <DuckCharacter 
        index={0}
        color="yellow" 
        state={state} 
        caretPosition={caretPosition} 
        typingSpeed={typingSpeed} 
        isValid={isValid} 
      />
      
      {/* Duck 2: Orange (Goofy) */}
      <DuckCharacter 
        index={1}
        color="orange" 
        state={state} 
        caretPosition={caretPosition} 
        typingSpeed={typingSpeed} 
        isValid={isValid} 
      />

      {/* Duck 3: Black (Mischievous) */}
      <DuckCharacter 
        index={2}
        color="black" 
        state={state} 
        caretPosition={caretPosition} 
        typingSpeed={typingSpeed} 
        isValid={isValid} 
      />
      
      {/* Stage platform */}
      <div className="absolute bottom-0 w-full h-1 bg-white/5 rounded-full blur-[1px]" />
    </div>
  );
}
