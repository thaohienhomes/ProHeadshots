"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/action/updateUser";

interface FormData {
  name: string;
  age: string;
  ethnicity: string;
  height: string;
  bodyType: string;
  eyeColor: string;
  gender: string;
}

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    ethnicity: "",
    height: "",
    bodyType: "",
    eyeColor: "",
    gender: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "gender") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "Male" ? "man" : "woman",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEyeColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, eyeColor: color }));
  };

  const getEyeColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      Hazel: "bg-amber-500",
      Gray: "bg-gray-400",
      "Light brown": "bg-amber-600",
      Blue: "bg-blue-500",
      Green: "bg-green-500",
      "Dark brown": "bg-amber-900",
    };
    return colorMap[color] || "bg-gray-300";
  };

  useEffect(() => {
    const isValid = Object.values(formData).every((value) => value !== "");
    setIsFormValid(isValid);
  }, [formData]);

  const handleSubmit = async () => {
    if (isFormValid && !isSubmitting) {
      setIsSubmitting(true);
      try {
        console.log("Submitting form data:", formData);
        const result = await updateUser(formData);

        // Check if there's an explicit error returned
        if (result && result.error) {
          console.error("Update user error:", result.error);
          alert(`Error: ${result.error}`);
          setIsSubmitting(false);
          return;
        }

        // If we reach here, the update was successful
        console.log("Form submitted successfully");

        // Redirect to styles page
        router.push("/upload/styles");
      } catch (error) {
        console.error("Error submitting form:", error);
        // Only show error alert for actual errors, not redirects
        if (
          error instanceof Error &&
          !error.message.includes("NEXT_REDIRECT")
        ) {
          alert("An unexpected error occurred. Please try again.");
        }
        setIsSubmitting(false);
      }
      // Note: Don't set setIsSubmitting(false) here if redirect is successful
      // as the page will be redirected anyway
    }
  };

  return (
    <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 min-h-screen p-4 pt-8 md:pt-16 text-center">
      {/* 5-step progress bar */}
      <div className="max-w-[280px] mx-auto mb-8">
        <div className="flex justify-between items-center gap-3">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  step <= 3
                    ? "bg-gradient-to-r from-cyan-400 to-primary-500 shadow-lg shadow-cyan-400/25"
                    : "bg-navy-700/50 border border-navy-600/30"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-sm text-navy-300 mt-3 font-medium">Step 3 of 5 - Personal Information</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4 max-w-2xl mx-auto">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-primary-200 bg-clip-text text-transparent">
              Add Your Personal Info
            </span>
          </h1>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto leading-relaxed">
            This information will help guide our AI towards creating headshots
            that look like you. All data is securely deleted after your headshots are
            completed.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-navy-800/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8">
          <form className="text-left space-y-6">
            {/* Name input */}
            <div>
              <label htmlFor="name" className="block text-white font-medium mb-3">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-4 border border-cyan-400/30 rounded-xl bg-navy-700/50 text-white placeholder-navy-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                placeholder="Enter your name"
              />
            </div>

            {/* Age select */}
            <div>
              <label htmlFor="age" className="block text-white font-medium mb-3">
                Age *
              </label>
              <select
                id="age"
                name="age"
                required
                value={formData.age}
                onChange={handleSelectChange}
                className="w-full p-4 border border-cyan-400/30 rounded-xl bg-navy-700/50 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              >
                <option value="" className="bg-navy-800 text-navy-400">Select your age</option>
                {[
                  "12-18 years",
                  "19-25 years",
                  "26-29 years",
                  "30-35 years",
                  "36-45 years",
                  "46-55 years",
                  "56-65 years",
                  "66-75 years",
                  "76+ years",
                ].map((age) => (
                  <option key={age} value={age} className="bg-navy-800 text-white">
                    {age}
                  </option>
                ))}
              </select>
            </div>

            {/* Ethnicity select */}
            <div>
              <label htmlFor="ethnicity" className="block text-white font-medium mb-3">
                Ethnicity *
              </label>
              <select
                id="ethnicity"
                name="ethnicity"
                required
                value={formData.ethnicity}
                onChange={handleSelectChange}
                className="w-full p-4 border border-cyan-400/30 rounded-xl bg-navy-700/50 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              >
                <option value="" className="bg-navy-800 text-navy-400">Select your ethnicity</option>
                {[
                  "African",
                  "Arabic",
                  "Asian",
                  "Black or African American",
                  "Caribbean",
                  "Indian",
                  "Melanesian",
                  "Polynesian",
                  "European",
                  "Caucasian",
                  "Latin American",
                  "Hispanic",
                  "Other",
                ].map((ethnicity) => (
                  <option key={ethnicity} value={ethnicity} className="bg-navy-800 text-white">
                    {ethnicity}
                  </option>
                ))}
              </select>
            </div>

            {/* Height select */}
            <div>
              <label htmlFor="height" className="block text-white font-medium mb-3">
                Height *
              </label>
              <select
                id="height"
                name="height"
                required
                value={formData.height}
                onChange={handleSelectChange}
                className="w-full p-4 border border-cyan-400/30 rounded-xl bg-navy-700/50 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              >
                <option value="" className="bg-navy-800 text-navy-400">Select your height</option>
                {[
                  "< 150 cm (4'11\")",
                  "150 - 160 cm (4'11\" - 5'3\")",
                  "161 - 170 cm (5'3\" - 5'7\")",
                  "171 - 180 cm (5'7\" - 5'11\")",
                  "181 - 190 cm (5'11\" - 6'3\")",
                  "≥ 190 cm (6'3\"+)",
                ].map((height) => (
                  <option key={height} value={height} className="bg-navy-800 text-white">
                    {height}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Type select */}
            <div>
              <label htmlFor="bodyType" className="block text-white font-medium mb-3">
                Body Type *
              </label>
              <select
                id="bodyType"
                name="bodyType"
                required
                value={formData.bodyType}
                onChange={handleSelectChange}
                className="w-full p-4 border border-cyan-400/30 rounded-xl bg-navy-700/50 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              >
                <option value="" className="bg-navy-800 text-navy-400">Select your body type</option>
                {[
                  "Ectomorph (Slim)",
                  "Mesomorph (Athletic)",
                  "Endomorph (Full)",
                ].map((bodyType) => (
                  <option key={bodyType} value={bodyType} className="bg-navy-800 text-white">
                    {bodyType}
                  </option>
                ))}
              </select>
            </div>

            {/* Eye Color buttons */}
            <div>
              <label className="block text-white font-medium mb-3">Eye Color *</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Hazel",
                  "Gray",
                  "Light brown",
                  "Blue",
                  "Green",
                  "Dark brown",
                ].map((eyeColor) => (
                  <button
                    key={eyeColor}
                    type="button"
                    onClick={() => handleEyeColorChange(eyeColor)}
                    className={`flex items-center justify-start p-4 border rounded-xl transition-all duration-300 ${
                      formData.eyeColor === eyeColor
                        ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/25"
                        : "border-cyan-400/30 bg-navy-700/30 hover:border-cyan-400/50 hover:bg-navy-700/50"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full mr-3 ${getEyeColorClass(
                        eyeColor
                      )} ${
                        formData.eyeColor === eyeColor
                          ? "ring-2 ring-cyan-400"
                          : ""
                      }`}
                    ></div>
                    <span className="text-white font-medium">{eyeColor}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender radio buttons */}
            <div>
              <label className="block text-white font-medium mb-3">Gender *</label>
              <div className="grid grid-cols-2 gap-3">
                {["Male", "Female"].map((gender) => (
                  <label
                    key={gender}
                    className={`flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.gender === (gender === "Male" ? "man" : "woman")
                        ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/25"
                        : "border-cyan-400/30 bg-navy-700/30 hover:border-cyan-400/50 hover:bg-navy-700/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      required
                      checked={
                        formData.gender === (gender === "Male" ? "man" : "woman")
                      }
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-white font-medium">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className={`w-full py-4 px-8 rounded-xl font-semibold transition-all duration-300 ${
                  isFormValid && !isSubmitting
                    ? "bg-gradient-to-r from-cyan-500 to-primary-600 text-white hover:from-cyan-400 hover:to-primary-500 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-navy-700/50 text-navy-400 cursor-not-allowed border border-navy-600/30"
                }`}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Continue to Styles →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
