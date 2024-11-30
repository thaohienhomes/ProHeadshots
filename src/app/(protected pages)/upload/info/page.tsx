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
    if (name === 'gender') {
      setFormData((prev) => ({ ...prev, [name]: value === 'Male' ? 'man' : 'woman' }));
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
      "Hazel": "bg-amber-500",
      "Gray": "bg-gray-400",
      "Light brown": "bg-amber-600",
      "Blue": "bg-blue-500",
      "Green": "bg-green-500",
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
        const result = await updateUser(formData);
        if (result && result.error) {
          // Show error message to the user
          alert("An error occurred. Please try again.");
        }
        // No need for else case as updateUser will redirect on success
      } catch (error) {
        console.error("Error submitting form:", error);
        alert("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-mainWhite min-h-screen p-4 pt-8 md:pt-16 text-center">
      {/* 5-step progress bar */}
      <div className="max-w-[240px] mx-auto mb-5">
        <div className="flex justify-between items-center gap-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  step <= 3
                    ? "bg-gradient-to-r from-mainOrange to-mainGreen animate-gradient bg-[length:200%_200%]"
                    : "bg-gray-200"
                }`}
              ></div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-mainBlack mt-2">Step 3 of 5</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-mainBlack mb-2 max-w-2xl mx-auto">
          Add your personal info
        </h1>
        <p className="text-md text-mainBlack mb-8 max-w-xl mx-auto">
          This information will help guide our AI towards creating headshots
          that look like you. It will be deleted after your headshots are
          completed.
        </p>

        <form className="max-w-md mx-auto text-left">
          {/* Name input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-mainBlack mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-mainBlack rounded bg-mainWhite text-mainBlack"
            />
          </div>

          {/* Age select */}
          <div className="mb-4">
            <label htmlFor="age" className="block text-mainBlack mb-2">
              Age *
            </label>
            <select
              id="age"
              name="age"
              required
              value={formData.age}
              onChange={handleSelectChange}
              className="w-full p-2 border border-mainBlack rounded bg-mainWhite text-mainBlack"
            >
              <option value="">Select your age</option>
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
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </div>

          {/* Ethnicity select */}
          <div className="mb-4">
            <label htmlFor="ethnicity" className="block text-mainBlack mb-2">
              Ethnicity *
            </label>
            <select
              id="ethnicity"
              name="ethnicity"
              required
              value={formData.ethnicity}
              onChange={handleSelectChange}
              className="w-full p-2 border border-mainBlack rounded bg-mainWhite text-mainBlack"
            >
              <option value="">Select your ethnicity</option>
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
                <option key={ethnicity} value={ethnicity}>
                  {ethnicity}
                </option>
              ))}
            </select>
          </div>

          {/* Height select */}
          <div className="mb-4">
            <label htmlFor="height" className="block text-mainBlack mb-2">
              Height *
            </label>
            <select
              id="height"
              name="height"
              required
              value={formData.height}
              onChange={handleSelectChange}
              className="w-full p-2 border border-mainBlack rounded bg-mainWhite text-mainBlack"
            >
              <option value="">Select your height</option>
              {[
                "< 150 cm (4'11\")",
                "150 - 160 cm (4'11\" - 5'3\")",
                "161 - 170 cm (5'3\" - 5'7\")",
                "171 - 180 cm (5'7\" - 5'11\")",
                "181 - 190 cm (5'11\" - 6'3\")",
                "≥ 190 cm (6'3\"+)",
              ].map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </div>

          {/* Body Type select */}
          <div className="mb-4">
            <label htmlFor="bodyType" className="block text-mainBlack mb-2">
              Body Type *
            </label>
            <select
              id="bodyType"
              name="bodyType"
              required
              value={formData.bodyType}
              onChange={handleSelectChange}
              className="w-full p-2 border border-mainBlack rounded bg-mainWhite text-mainBlack"
            >
              <option value="">Select your body type</option>
              {[
                "Ectomorph (Slim)",
                "Mesomorph (Athletic)",
                "Endomorph (Full)",
              ].map((bodyType) => (
                <option key={bodyType} value={bodyType}>
                  {bodyType}
                </option>
              ))}
            </select>
          </div>

          {/* Eye Color buttons */}
          <div className="mb-4">
            <label className="block text-mainBlack mb-2">Eye Color *</label>
            <div className="grid grid-cols-3 gap-2">
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
                  className={`flex items-center justify-start p-2 border ${
                    formData.eyeColor === eyeColor
                      ? "border-mainOrange bg-mainOrange/10"
                      : "border-mainBlack bg-mainWhite"
                  } rounded text-mainBlack hover:bg-opacity-90 transition-colors`}
                >
                  <div
                    className={`w-6 h-6 rounded-full mr-2 ${getEyeColorClass(
                      eyeColor
                    )} ${
                      formData.eyeColor === eyeColor
                        ? "ring-2 ring-mainOrange"
                        : ""
                    }`}
                  ></div>
                  <span>{eyeColor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gender radio buttons */}
          <div className="mb-4">
            <label className="block text-mainBlack mb-2">Gender *</label>
            <div className="flex gap-4">
              {["Male", "Female"].map((gender) => (
                <label
                  key={gender}
                  className="flex items-center text-mainBlack"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    required
                    checked={formData.gender === (gender === 'Male' ? 'man' : 'woman')}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className={`bg-mainOrange text-mainBlack py-3 px-6 rounded-full font-semibold transition-colors inline-block ${
              isFormValid && !isSubmitting
                ? "hover:bg-opacity-90"
                : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Next →"}
          </button>
        </form>
      </div>
    </div>
  );
}
