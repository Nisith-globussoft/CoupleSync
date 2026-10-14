const TRUTH_OR_DARE = {
  romantic: {
    truths: [
      "What was the exact moment you realized you had real feelings for me?",
      "If we could run away anywhere in the world together tomorrow for 48 hours, where are we going?",
      "What is your favorite memory of us together so far?",
      "What is one cute or funny habit of mine that you secretly love?",
      "What song instantly reminds you of us?",
      "What was your honest first impression of me the first time we met?"
    ],
    dares: [
      "Send a 15-second voice note singing the chorus of your partner's favorite love song right now!",
      "Change your profile picture or status to something cute chosen by your partner for the next hour.",
      "Send your favorite selfie of the two of you with a heart caption into the chat.",
      "Whisper the sweetest compliment you've ever thought about your partner right into your mic/phone.",
      "Plan a surprise mini date night activity for this upcoming weekend right now."
    ]
  },
  spicy: {
    truths: [
      "What is something I wear that makes your heart skip a beat every time?",
      "What is a romantic fantasy you haven't dared to mention yet?",
      "Where is the most exciting place you've ever wanted to kiss me?",
      "What was the most intense butterfly-inducing moment we've shared?",
      "If you could have me grant any one wish right now, what would it be?"
    ],
    dares: [
      "Send a sultry 5-second selfie or video reaction looking intensely into the camera.",
      "Give a passionate description of how our next reunion will start.",
      "Type out 3 things you find most irresistible about your partner.",
      "Give your partner a romantic nickname and use it for the rest of tonight's hangout."
    ]
  },
  funny: {
    truths: [
      "What is the most embarrassing thing you've done to impress someone you liked?",
      "What is the weirdest food combo that you secretly enjoy?",
      "If I were a dessert, what kind of dessert would I be and why?",
      "Who takes longer to get ready when we go out?",
      "What is the silliest argument we have ever had?"
    ],
    dares: [
      "Type a message to your partner using only emojis describing your day.",
      "Do your best impression of how your partner talks when they are sleepy.",
      "Send a candid goofy face selfie right now without retaking it!",
      "Speak in a dramatic Shakespearean accent for the next 2 turns."
    ]
  },
  deep: {
    truths: [
      "What does 'home' feel like to you when you think about our bond?",
      "What is one fear or insecurity you felt comfortable overcoming because of me?",
      "In what way do you think we've both grown the most since knowing each other?",
      "What is something you dream about us doing 5 years from today?",
      "What is one thing you appreciate about me that I might not even realize?"
    ],
    dares: [
      "Write a 3-sentence heartfelt letter in the chat expressing gratitude for your partner.",
      "Close your eyes for 30 seconds together while listening to the current song, then share what you visualized.",
      "Name 3 qualities in your partner that make you feel truly safe and cherished."
    ]
  }
};

const COUPLE_QUIZ = [
  {
    id: 'cq-1',
    question: "When your partner has had a super exhausting day, what is their ultimate comfort go-to?",
    options: [
      "Snuggling up with comfort food & a cozy movie",
      "Going out for fresh air or a long drive",
      "Total quiet time alone to recharge",
      "Vent session with warm tea or coffee"
    ],
    explanation: "Comfort languages reveal how we recharge together!"
  },
  {
    id: 'cq-2',
    question: "What would your dream vacation style be together?",
    options: [
      "Secluded beach villa with sunsets and cocktails",
      "Bustling city adventure exploring food and night markets",
      "Cozy mountain cabin surrounded by snow and pines",
      "Thrill-seeking road trip with no fixed schedule"
    ],
    explanation: "Travel alignment is one of the highest couple compatibility markers."
  },
  {
    id: 'cq-3',
    question: "What is your partner's love language priority?",
    options: [
      "Words of Affirmation & sweet messages",
      "Quality Time (undivided attention & shared vibes)",
      "Physical Touch & close hugs",
      "Acts of Service & caring gestures"
    ],
    explanation: "Knowing each other's primary love language brings effortless harmony."
  },
  {
    id: 'cq-4',
    question: "If you could order dinner right now with zero budget limit, what cuisine wins?",
    options: [
      "Gourmet Italian Pizza & Pasta with Wine",
      "Authentic Spicy Asian Street Food / Sushi",
      "Rich North Indian Biryani & Butter Chicken",
      "Juicy Burgers, Crispy Fries & Thick Shakes"
    ],
    explanation: "Food debates have tested couples since the dawn of time!"
  },
  {
    id: 'cq-5',
    question: "Who is more likely to fall asleep during a late-night movie marathon?",
    options: [
      "Definitely the Host / Me!",
      "100% my Partner",
      "Both of us knock out before the climax",
      "Neither — we stay awake chatting till 3 AM"
    ],
    explanation: "The eternal late-night cuddle dilemma."
  }
];

const WOULD_YOU_RATHER = [
  {
    id: 'wyr-1',
    scenario: "Couples Lifestyle Choice",
    optionA: "Live in a peaceful seaside cottage where you hear ocean waves every morning",
    optionB: "Live in a high-rise luxury penthouse with panoramic city lights at midnight"
  },
  {
    id: 'wyr-2',
    scenario: "Vacation Dilemma",
    optionA: "A surprise luxury all-inclusive weekend getaway planned 100% by your partner",
    optionB: "A 2-week backpacking adventure across scenic countries you plan together"
  },
  {
    id: 'wyr-3',
    scenario: "Couple Superpower",
    optionA: "Have the superpower to telepathically hear each other's loving thoughts anytime",
    optionB: "Have the superpower to teleport to each other's side instantly for 10 minutes every day"
  },
  {
    id: 'wyr-4',
    scenario: "Date Night Style",
    optionA: "Dressing up fancy for a 5-star candlelit rooftop dinner",
    optionB: "Messy midnight cooking in pajamas while dancing in the kitchen"
  },
  {
    id: 'wyr-5',
    scenario: "Memory Capsule",
    optionA: "Relive the very first day you met for 24 magical hours",
    optionB: "Fast forward for a sneak peek of your 10th anniversary celebration"
  }
];

module.exports = {
  TRUTH_OR_DARE,
  COUPLE_QUIZ,
  WOULD_YOU_RATHER
};
