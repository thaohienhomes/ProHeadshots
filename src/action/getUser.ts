"use server"
import { createClient } from "@/utils/supabase/server";

export default async function getUser() {
  const supabase = createClient();
  
  // Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    console.error("No authenticated user found");
    return null;
  }

  // Query the 'userTable' for the current user's data
  const { data, error } = await supabase
    .from('userTable')
    .select()
    .eq('id', userId);
 
  if (error) {
    console.error("Error fetching user data from Supabase:", error);
    return null;
  }

  if (data && data.length > 0) {
    return data;
  } else {
    console.warn("No user data found for the current user");
    return null;
  }
}


/**
 * // Returned data structure:
[
  {
    created_at: '2024-09-08T17:15:45.737513+00:00',
    email: 'johnnetr+5@gmail.com',
    id: '95065e2a-6e13-4dc8-8e84-0a703d34fc28',
    paymentStatus: 'paid',
    amount: 2900,
    planType: 'basic',
    paid_at: null,
    name: 'Johnny Tran',
    height: `161 - 170 cm (5'3" - 5'7")`,
    gender: 'Male',
    eyeColor: 'Hazel',
    ethnicity: 'Asian',
    bodyType: 'Mesomorph (Athletic)',
    age: '26-29 years',
    styles: [
  {
    "type": "userSelected",
    "styles": [
      {
        "clothing": "Dark blue tailored suit",
        "background": "Marina"
      },
      {
        "clothing": "Black tweed jacket",
        "background": "Marina"
      },
      {
        "clothing": "Multicolored striped sweater",
        "background": "Lobby"
      },
      {
        "clothing": "Light blue short-sleeve button-down",
        "background": "Realtor"
      },
      {
        "clothing": "Black graduation robe",
        "background": "Kitchen"
      },
      {
        "clothing": "Navy blue short-sleeve polo",
        "background": "Yellow brick"
      }
    ]
  },
  {
    "type": "preSelected",
    "styles": [
      {
        "clothing": "a white buttoned shirt",
        "background": "Garden"
      },
      {
        "clothing": "a black sweater",
        "background": "Office"
      },
      {
        "clothing": "a light gray suit jacket over a white dress shirt",
        "background": "Grey"
      },
      {
        "clothing": "a black sweater",
        "background": "Outdoors"
      }
    ]
  }
],
    userPhotos: {
  "userSelfies": [
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496960876-IMG_1232%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496961988-IMG_1236%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496962933-IMG_1237%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496964049-Screenshot%202024-09-13%20at%2014.44.35.png",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496965101-Screenshot%202024-09-13%20at%2014.45.56.png",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496966186-2.png",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496967314-1.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496968436-Screenshot%202024-09-13%20at%2014.46.26.png",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496969538-IMG_0570.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496970857-IMG_0571.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496972172-IMG_0574.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496973478-IMG_1242%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496974643-IMG_1243%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496975887-IMG_1253%202.jpeg",
    "https://bovtokbsxuyuotbotmgx.supabase.co/storage/v1/object/public/userphotos/95065e2a-6e13-4dc8-8e84-0a703d34fc28/selfies/1726496977462-IMG_1254%202.jpeg"
  ]
},
    submissionDate: '2024-09-16T19:09:59.909+00:00',
    workStatus: 'completed',
    downloadHistory: [
      'https://sdbooth2-production.s3.amazonaws.com/km9vd71j4ap8m0t7yuoa4e30kggm',
      'https://sdbooth2-production.s3.amazonaws.com/0dh0sj1q455xgui78qpkjb36znl2',
      'https://sdbooth2-production.s3.amazonaws.com/0dh0sj1q455xgui78qpkjb36znl2'
    ],
    apiStatus: {
      id: 1627188,
      eta: '2024-09-19T16:09:11.876Z',
      url: 'https://api.astria.ai/tunes/1627188.json',
      args: null,
      name: 'cat',
      steps: null,
      title: '95065e2a-6e13-4dc8-8e84-0a703d34fc28',
      token: 'sks',
      branch: 'fast',
      is_api: true,
      prompts: [Array],
      callback: null,
      ckpt_url: null,
      ckpt_urls: [],
      face_crop: false,
      created_at: '2024-09-19T16:05:11.698Z',
      expires_at: null,
      model_type: null,
      trained_at: null,
      updated_at: '2024-09-19T16:05:11.723Z',
      orig_images: [Array],
      base_tune_id: null,
      started_training_at: null
    },
    modelId: null
  }
]
 */