'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Array of sample profiles for different industries
const typingTexts = [
  `John Doe\nSoftware Engineer\n\nExperience:\n- Senior Developer at Tech Co.\n- Lead Engineer at Startup Inc.\n\nSkills:\n- JavaScript, React, Node.js\n- Python, Django\n- AWS, Docker`,
  
  `Jane Smith\nGraphic Designer\n\nExperience:\n- Creative Lead at DesignStudio\n- Freelance Designer\n\nSkills:\n- Adobe Photoshop, Illustrator\n- Sketch, Figma\n- Branding, Typography, Illustration`,
  
  `Alex Johnson\nMarketing Specialist\n\nExperience:\n- Digital Marketer at Marketify\n- Content Strategist at BrandBoost\n\nSkills:\n- SEO, Content Marketing\n- Google Analytics, AdWords\n- Social Media Strategy`
];

const AutoTypingHeroText = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const [textIndex, setTextIndex] = useState(0);
  const typingSpeed = 50;
  const pauseBetweenTexts = 2000; // Pause duration between profiles

  useEffect(() => {
    let currentIndex = 0;
    const currentText = typingTexts[textIndex];

    // Clear displayedText at the start of each profile
    setDisplayedText('');

    const typeCharacter = () => {
      // Update displayedText to be the current slice of currentText
      setDisplayedText(currentText.slice(0, currentIndex));
      currentIndex += 1;

      if (currentIndex <= currentText.length) {
        // Continue typing if there's more text
        setTimeout(typeCharacter, typingSpeed);
      } else {
        // Pause before moving to the next profile
        setTimeout(() => {
          setTextIndex((prevIndex) => (prevIndex + 1) % typingTexts.length); // Move to the next profile
        }, pauseBetweenTexts);
      }
    };

    typeCharacter(); // Start typing effect for current profile

    // Blinking cursor effect
    const cursorInterval = setInterval(() => {
      setIsCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval); // Clean up cursor interval on unmount
  }, [textIndex]); // Restart typing effect whenever textIndex changes

  return (
    <motion.pre
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative font-mono text-lg lg:text-xl text-black whitespace-pre-line leading-relaxed"
      style={{ color: 'black' }}
    >
      {displayedText}
      <span className={`cursor ${isCursorVisible ? 'visible' : 'invisible'}`}>
        |
      </span>
    </motion.pre>
  );
};

export default AutoTypingHeroText;
