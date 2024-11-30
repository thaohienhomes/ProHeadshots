"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Header from "@/components/Header";
import Footer from "@/components/landing/Footer";
import { createClient } from "@/utils/supabase/client";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  email?: string;
  subject?: string;
  message?: string;
}

export default function Contact(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    let tempErrors: FormErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      tempErrors.email = "Email is invalid";
    if (!formData.subject) tempErrors.subject = "Subject is required";
    if (!formData.message) tempErrors.message = "Message is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contact")
        .insert(formData)
        .select();

      if (data) {
        setIsSubmitted(true);
      } else {
        console.error("Error uploading to Supabase:", error);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mainWhite text-mainBlack flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {!isSubmitted && (
            <>
              <h1 className="text-4xl font-bold mb-6 text-center">Contact Us</h1>
              <p className="mb-8 text-center text-lg">
                Want to become a country or affiliate partner? Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </>
          )}
          <div className="bg-mainGreen bg-opacity-10 p-8 rounded-lg shadow-lg">
            {isSubmitted ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
                <p>Your message has been sent. We will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2 font-semibold">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 bg-mainWhite text-mainBlack rounded-md border border-mainBlack focus:outline-none focus:ring-2 focus:ring-mainGreen"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 font-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full p-3 bg-mainWhite text-mainBlack rounded-md border ${
                      errors.email ? "border-red-500" : "border-mainBlack"
                    } focus:outline-none focus:ring-2 focus:ring-mainGreen`}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="subject" className="block mb-2 font-semibold">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full p-3 bg-mainWhite text-mainBlack rounded-md border ${
                      errors.subject ? "border-red-500" : "border-mainBlack"
                    } focus:outline-none focus:ring-2 focus:ring-mainGreen`}
                    required
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2 font-semibold">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full p-3 bg-mainWhite text-mainBlack rounded-md border ${
                      errors.message ? "border-red-500" : "border-mainBlack"
                    } focus:outline-none focus:ring-2 focus:ring-mainGreen`}
                    required
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                  )}
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-mainBlack text-mainWhite py-3 px-6 rounded-full hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer className="bg-mainBlack text-mainWhite" />
    </div>
  );
}
