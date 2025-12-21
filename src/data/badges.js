// Badge definitions with requirements and rewards
export const badgesData = [
    // Streak Badges
    {
        id: 1,
        name: "İlk Adım",
        nameEn: "First Step",
        description: "İlk pratiğini tamamla",
        icon: "🎯",
        category: "streak",
        rarity: "common",
        requirement: { type: "practice_count", value: 1 },
        xpReward: 10
    },
    {
        id: 2,
        name: "Düzenli Öğrenci",
        nameEn: "Regular Student",
        description: "3 gün üst üste pratik yap",
        icon: "📅",
        category: "streak",
        rarity: "common",
        requirement: { type: "streak", value: 3 },
        xpReward: 25
    },
    {
        id: 3,
        name: "Haftalık Savaşçı",
        nameEn: "Weekly Warrior",
        description: "7 gün üst üste pratik yap",
        icon: "🔥",
        category: "streak",
        rarity: "uncommon",
        requirement: { type: "streak", value: 7 },
        xpReward: 50
    },
    {
        id: 4,
        name: "İki Haftalık Şampiyon",
        nameEn: "Two Week Champion",
        description: "14 gün üst üste pratik yap",
        icon: "🏆",
        category: "streak",
        rarity: "rare",
        requirement: { type: "streak", value: 14 },
        xpReward: 100
    },
    {
        id: 5,
        name: "Ay Ustası",
        nameEn: "Month Master",
        description: "30 gün üst üste pratik yap",
        icon: "👑",
        category: "streak",
        rarity: "epic",
        requirement: { type: "streak", value: 30 },
        xpReward: 250
    },

    // Word Learning Badges
    {
        id: 10,
        name: "Kelime Toplayıcı",
        nameEn: "Word Collector",
        description: "10 kelime öğren",
        icon: "📝",
        category: "learning",
        rarity: "common",
        requirement: { type: "words_learned", value: 10 },
        xpReward: 20
    },
    {
        id: 11,
        name: "Kelime Avcısı",
        nameEn: "Word Hunter",
        description: "50 kelime öğren",
        icon: "🎣",
        category: "learning",
        rarity: "uncommon",
        requirement: { type: "words_learned", value: 50 },
        xpReward: 75
    },
    {
        id: 12,
        name: "Kelime Ustası",
        nameEn: "Word Master",
        description: "100 kelime öğren",
        icon: "📚",
        category: "learning",
        rarity: "rare",
        requirement: { type: "words_learned", value: 100 },
        xpReward: 150
    },
    {
        id: 13,
        name: "Sözlük Kahramanı",
        nameEn: "Dictionary Hero",
        description: "250 kelime öğren",
        icon: "🦸",
        category: "learning",
        rarity: "epic",
        requirement: { type: "words_learned", value: 250 },
        xpReward: 300
    },
    {
        id: 14,
        name: "Vocabulary Efsanesi",
        nameEn: "Vocabulary Legend",
        description: "500 kelime öğren",
        icon: "🌟",
        category: "learning",
        rarity: "legendary",
        requirement: { type: "words_learned", value: 500 },
        xpReward: 500
    },

    // Reading Badges
    {
        id: 20,
        name: "Okuyucu",
        nameEn: "Reader",
        description: "İlk haberi oku",
        icon: "📰",
        category: "reading",
        rarity: "common",
        requirement: { type: "articles_read", value: 1 },
        xpReward: 15
    },
    {
        id: 21,
        name: "Kitap Kurdu",
        nameEn: "Bookworm",
        description: "10 içerik oku",
        icon: "🐛",
        category: "reading",
        rarity: "uncommon",
        requirement: { type: "articles_read", value: 10 },
        xpReward: 60
    },
    {
        id: 22,
        name: "Okuma Maratoncusu",
        nameEn: "Reading Marathoner",
        description: "25 içerik oku",
        icon: "🏃",
        category: "reading",
        rarity: "rare",
        requirement: { type: "articles_read", value: 25 },
        xpReward: 125
    },

    // Practice Badges
    {
        id: 30,
        name: "Pratik Yapan",
        nameEn: "Practitioner",
        description: "10 pratik tamamla",
        icon: "💪",
        category: "practice",
        rarity: "common",
        requirement: { type: "practice_count", value: 10 },
        xpReward: 30
    },
    {
        id: 31,
        name: "Çalışkan Arı",
        nameEn: "Busy Bee",
        description: "50 pratik tamamla",
        icon: "🐝",
        category: "practice",
        rarity: "uncommon",
        requirement: { type: "practice_count", value: 50 },
        xpReward: 100
    },
    {
        id: 32,
        name: "Pratik Ustası",
        nameEn: "Practice Master",
        description: "100 pratik tamamla",
        icon: "🎓",
        category: "practice",
        rarity: "rare",
        requirement: { type: "practice_count", value: 100 },
        xpReward: 200
    },

    // Accuracy Badges
    {
        id: 40,
        name: "Doğru Cevapçı",
        nameEn: "Accurate Answerer",
        description: "Bir pratikte %100 doğruluk yap",
        icon: "✅",
        category: "accuracy",
        rarity: "uncommon",
        requirement: { type: "perfect_practice", value: 1 },
        xpReward: 40
    },
    {
        id: 41,
        name: "Mükemmeliyetçi",
        nameEn: "Perfectionist",
        description: "5 pratikte %100 doğruluk yap",
        icon: "💯",
        category: "accuracy",
        rarity: "rare",
        requirement: { type: "perfect_practice", value: 5 },
        xpReward: 150
    },

    // XP Badges
    {
        id: 50,
        name: "XP Başlangıcı",
        nameEn: "XP Starter",
        description: "100 XP kazan",
        icon: "⭐",
        category: "xp",
        rarity: "common",
        requirement: { type: "total_xp", value: 100 },
        xpReward: 0
    },
    {
        id: 51,
        name: "XP Toplayıcı",
        nameEn: "XP Collector",
        description: "500 XP kazan",
        icon: "🌟",
        category: "xp",
        rarity: "uncommon",
        requirement: { type: "total_xp", value: 500 },
        xpReward: 0
    },
    {
        id: 52,
        name: "XP Zenginesi",
        nameEn: "XP Mogul",
        description: "1000 XP kazan",
        icon: "💎",
        category: "xp",
        rarity: "rare",
        requirement: { type: "total_xp", value: 1000 },
        xpReward: 0
    },
    {
        id: 53,
        name: "XP Milyoneri",
        nameEn: "XP Millionaire",
        description: "5000 XP kazan",
        icon: "🏅",
        category: "xp",
        rarity: "epic",
        requirement: { type: "total_xp", value: 5000 },
        xpReward: 0
    },

    // Level Badges
    {
        id: 60,
        name: "A1 Mezunu",
        nameEn: "A1 Graduate",
        description: "A1 seviyesini tamamla",
        icon: "🎖️",
        category: "level",
        rarity: "uncommon",
        requirement: { type: "level_complete", value: "A1" },
        xpReward: 100
    },
    {
        id: 61,
        name: "A2 Mezunu",
        nameEn: "A2 Graduate",
        description: "A2 seviyesini tamamla",
        icon: "🏵️",
        category: "level",
        rarity: "rare",
        requirement: { type: "level_complete", value: "A2" },
        xpReward: 150
    },
    {
        id: 62,
        name: "B1 Mezunu",
        nameEn: "B1 Graduate",
        description: "B1 seviyesini tamamla",
        icon: "🎗️",
        category: "level",
        rarity: "rare",
        requirement: { type: "level_complete", value: "B1" },
        xpReward: 200
    },
    {
        id: 63,
        name: "B2 Mezunu",
        nameEn: "B2 Graduate",
        description: "B2 seviyesini tamamla",
        icon: "🥇",
        category: "level",
        rarity: "epic",
        requirement: { type: "level_complete", value: "B2" },
        xpReward: 300
    },
    {
        id: 64,
        name: "C1 Ustası",
        nameEn: "C1 Master",
        description: "C1 seviyesine ulaş",
        icon: "👑",
        category: "level",
        rarity: "legendary",
        requirement: { type: "level_complete", value: "C1" },
        xpReward: 500
    }
];

// Rarity colors
export const rarityColors = {
    common: "#9CA3AF",  // gray
    uncommon: "#10B981", // green
    rare: "#3B82F6",    // blue
    epic: "#8B5CF6",    // purple
    legendary: "#F59E0B" // gold
};

// Get badges by category
export const getBadgesByCategory = (category) => {
    return badgesData.filter(badge => badge.category === category);
};

// Get badge by id
export const getBadgeById = (id) => {
    return badgesData.find(badge => badge.id === parseInt(id));
};

// Check if user earned a badge
export const checkBadgeEarned = (badge, userStats) => {
    const req = badge.requirement;

    switch (req.type) {
        case "streak":
            return userStats.currentStreak >= req.value;
        case "words_learned":
            return userStats.wordsLearned >= req.value;
        case "articles_read":
            return userStats.articlesRead >= req.value;
        case "practice_count":
            return userStats.practiceCount >= req.value;
        case "perfect_practice":
            return userStats.perfectPractices >= req.value;
        case "total_xp":
            return userStats.totalXp >= req.value;
        case "level_complete":
            return userStats.completedLevels?.includes(req.value);
        default:
            return false;
    }
};
