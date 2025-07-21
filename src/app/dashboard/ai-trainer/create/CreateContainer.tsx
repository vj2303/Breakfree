"use client";

import React, { useState } from 'react';
import {
  LetterText,
  CircleUser,
  Lightbulb,
  Factory,
  Mailbox,
  SlidersHorizontal
} from 'lucide-react';
import Header from './Header';
import Dropdown from '@/components/Dropdown';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import SettingsPopUp from '@/components/SettingsPopUp'; // Import the new component
import {
  audienceTypeOptions,
  contentTypeOptions,
  deliveryMethodOptions,
  outputTypeOptions,
  industryTypeOptions
} from '@/constants/options';

const CreateContainer = ({ handleGetPrompts, prompt, handleChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettingsModal = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-[32px] max-w-[1300px] mx-auto h-full overflow-y-auto px-4 py-6">
        <button onClick={toggleSettingsModal} className='flex items-center justify-center self-end mb-4  text-white p-2 rounded-lg '>
            <SlidersHorizontal size={30} className='text-black cursor-pointer' />
          </button>
        <div className="items-center justify-center flex">
          <Header />
       
        </div>
        <div className="flex items-start gap-[20px] flex-wrap w-full">
          {/* Dropdowns */}
          <Dropdown
              img={<img src="/Icons/typeOfContentIcon.png" alt="Type of Content Icon" className='h-8 w-8' />}
              options={contentTypeOptions}
              name="content_type"
              label="Type Of Content"
              onChange={handleChange}
            />

          <Dropdown
            // img={<CircleUser />}
            img={<img src="/Icons/typeOfAudience.png" alt="Type of Content Icon" className='h-8 w-8' />}
            options={audienceTypeOptions}
            name="audience_type"
            label="Type Of Audience"
            onChange={handleChange}
          />
          <Dropdown
            // img={<Mailbox />}
            img={<img src="/Icons/DeliveryMethod.png" alt="Type of Content Icon" className='h-8 w-8' />}
            options={deliveryMethodOptions}
            name="delivery_method"
            label="Delivery Method"
            onChange={handleChange}
          />
          <Dropdown
            // img={<Lightbulb />}
            img={<img src="/Icons/ContentTheme.png" alt="Type of Content Icon" className='h-8 w-8' />}
            options={outputTypeOptions}
            name="content_theme"
            label="Content Theme"
            onChange={handleChange}
          />
          <Dropdown
            // img={<Factory />}
            img={<img src="/Icons/Icons.png" alt="Type of Content Icon" className='h-8 w-8' />}
            options={industryTypeOptions}
            name="target_industry"
            label="Target Industry"
            onChange={handleChange}
          />
        </div>
        {/* Generate Button */}
        <div className="mt-[10px]">
          <Button
            bg={"dark-bg"}
            text="white"
            onClick={() => handleGetPrompts(prompt)}
          >
            Generate
            <Image
              src={"/Vector.png"}
              alt="star"
              width={20}
              height={20}
              className="hover:brightness-150"
            />
          </Button>
        </div>
      </div>

      {/* Settings PopUp */}
      <SettingsPopUp isOpen={isSettingsOpen} onClose={toggleSettingsModal} />
    </>
  );
};

export default CreateContainer;
