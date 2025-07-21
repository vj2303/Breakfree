"use client";

import React, { useState } from "react";
import CreateContainer from "./CreateContainer";
import Responses from "./ResponsesContainer";
import ChatContainer from "./ChatContainer";
import axios from "axios";

type Prompt = {
  content_type: string;
  audience_type: string;
  delivery_method: string;
  content_theme: string;
  target_industry: string;
};

type PromptResponse = {
  summary: string;
};

const Page = () => {
  const [currentPage, setCurrentPage] = useState<string>("create");
  const [prompts, setPrompts] = useState<PromptResponse[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<Prompt>({
    content_type: "",
    audience_type: "",
    delivery_method: "",
    content_theme: "",
    target_industry: "",
  });

  // Handle dropdown changes
  const handleChange = (name: string, value: string) => {
    setPrompt({ ...prompt, [name]: value });
  };

  // API Call to Fetch Prompts
  const handleGetPrompts = async (data?: any) => {
    setIsLoading(true);
    setCurrentPage("res");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/generate-prompts`,
        data || prompt,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("API Response:", res.data); // Debugging API response

      // Process and format response
      if (res.data && res.data.prompts) {
        const formattedPrompts = res.data.prompts.map((item: any, index: number) => {
          const summaryKey = `summary${index + 1}`;
          return {
            summary: item[summaryKey] || "No summary available",
          };
        });

        setPrompts(formattedPrompts);
      } else {
        setPrompts([]);
        alert("No valid prompts received from the API");
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      alert("Could not generate responses");
      setPrompts([]);
      setCurrentPage("create");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a prompt
  const handleSelectPrompt = (selected: string) => {
    setSelectedPrompt(selected);
    setCurrentPage("chat");
  };

  return (
    <div className="h-full">
      {currentPage === "create" ? (
        <CreateContainer
          handleGetPrompts={handleGetPrompts}
          prompt={prompt}
          handleChange={handleChange}
        />
      ) : currentPage === "res" ? (
        <Responses
          prompts={prompts}
          handleSelectPrompt={handleSelectPrompt}
          isLoading={isLoading}
          prompt={prompt}
          handleChange={handleChange}
          handleGetPrompts={handleGetPrompts}
        />
      ) : currentPage === "chat" && selectedPrompt ? (
        <ChatContainer selectedPrompt={selectedPrompt} />
      ) : null}
    </div>
  );
};

export default Page;
