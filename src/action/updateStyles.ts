'use server'

import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';

// Define the StyleObject interface
interface StyleObject {
  background: string;
  clothing: string;
}

export async function updateStyles({
  userSelected,
  preSelected
}: {
  userSelected: StyleObject[];
  preSelected: StyleObject[];
}) {
  const supabase = createClient();
  
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  console.log('Updating styles for user:', userId);
  console.log('User selected styles:', userSelected);
  console.log('Preselected styles:', preSelected);

  if (!userId) {
    console.error("No authenticated user found");
    throw new Error("User not authenticated");
  }

  // Create a JSONB array with userSelected and preselected objects
  const stylesArray = [
    { type: 'userSelected', styles: userSelected },
    { type: 'preSelected', styles: preSelected }
  ];

  // Update the user's styles in the 'userTable'
  const { data, error } = await supabase
    .from('userTable')
    .update({ styles: stylesArray })
    .eq('id', userId);

  if (error) {
    console.error("Error updating user styles in Supabase:", error);
    throw new Error("Failed to update user styles");
  }

  console.log('Styles updated successfully:', stylesArray);

  // Redirect to the next page (adjust as needed)
  redirect('/upload/summary');
}

// Data structure of stylesArray
// User selected styles: [
//   { background: 'Marina', clothing: 'Dark blue tailored suit' },
//   { background: 'Marina', clothing: 'Black tweed jacket' },
//   { background: 'Lobby', clothing: 'Multicolored striped sweater' },
//   {
//     background: 'Realtor',
//     clothing: 'Light blue short-sleeve button-down'
//   },
//   { background: 'Kitchen', clothing: 'Black graduation robe' },
//   {
//     background: 'Yellow brick',
//     clothing: 'Navy blue short-sleeve polo'
//   }
// ]
// Preselected styles: [
//   { background: 'Garden', clothing: 'a white buttoned shirt' },
//   { background: 'Office', clothing: 'a black sweater' },
//   {
//     background: 'Grey',
//     clothing: 'a light gray suit jacket over a white dress shirt'
//   },
//   { background: 'Outdoors', clothing: 'a black sweater' }
// ]
// Styles updated successfully: [
//   {
//     type: 'userSelected',
//     styles: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
//   },
//   {
//     type: 'preSelected',
//     styles: [ [Object], [Object], [Object], [Object] ]
//   }
// ]
