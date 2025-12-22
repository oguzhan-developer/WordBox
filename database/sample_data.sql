-- WordBox Sample Data - Rich Content for Testing
-- Run after schema_clean.sql

-- =============================================================================
-- MORE WORDS (Total: 50+ words across all levels)
-- =============================================================================

-- A1 Level Words (Basic)
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr, synonyms, tags, is_common) VALUES
('hello', '/həˈloʊ/', 'interjection', 'A1', '["merhaba", "selam"]', '["a greeting used when meeting someone"]', '["Hello, how are you?", "Say hello to everyone!"]', '["Merhaba, nasılsın?", "Herkese merhaba de!"]', '["hi", "hey", "greetings"]', '["greeting", "basic"]', true),
('friend', '/frend/', 'noun', 'A1', '["arkadaş", "dost"]', '["a person whom one knows and likes"]', '["She is my best friend.", "I made a new friend at school."]', '["O benim en iyi arkadaşım.", "Okulda yeni bir arkadaş edindim."]', '["buddy", "pal", "companion"]', '["relationship", "basic"]', true),
('happy', '/ˈhæpi/', 'adjective', 'A1', '["mutlu", "sevinçli"]', '["feeling or showing pleasure or contentment"]', '["I am so happy today!", "Happy birthday to you!"]', '["Bugün çok mutluyum!", "Doğum günün kutlu olsun!"]', '["joyful", "cheerful", "glad"]', '["emotion", "positive"]', true),
('eat', '/iːt/', 'verb', 'A1', '["yemek", "yemek yemek"]', '["to put food in your mouth and swallow it"]', '["I eat breakfast every morning.", "What do you want to eat?"]', '["Her sabah kahvaltı yaparım.", "Ne yemek istiyorsun?"]', '["consume", "dine"]', '["food", "basic", "daily"]', true),
('water', '/ˈwɔːtər/', 'noun', 'A1', '["su"]', '["a clear liquid that has no color, taste, or smell"]', '["I drink water every day.", "The water is cold."]', '["Her gün su içerim.", "Su soğuk."]', '["H2O", "liquid"]', '["drink", "basic", "nature"]', true),
('book', '/bʊk/', 'noun', 'A1', '["kitap"]', '["a written or printed work consisting of pages"]', '["I love reading books.", "This book is interesting."]', '["Kitap okumayı severim.", "Bu kitap ilginç."]', '["novel", "publication", "text"]', '["education", "reading"]', true),
('school', '/skuːl/', 'noun', 'A1', '["okul"]', '["an institution for educating children"]', '["I go to school by bus.", "Our school is big."]', '["Otobüsle okula gidiyorum.", "Okulumuz büyük."]', '["academy", "institution"]', '["education", "place"]', true),
('family', '/ˈfæmɪli/', 'noun', 'A1', '["aile"]', '["a group of people related to each other"]', '["I love my family.", "Family is important."]', '["Ailemi seviyorum.", "Aile önemlidir."]', '["relatives", "household"]', '["relationship", "basic"]', true)
ON CONFLICT (word) DO NOTHING;

-- A2 Level Words (Elementary)
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr, synonyms, tags, is_common) VALUES
('travel', '/ˈtrævəl/', 'verb', 'A2', '["seyahat etmek", "gezmek"]', '["to go from one place to another"]', '["I love to travel.", "We traveled to Paris last summer."]', '["Seyahat etmeyi seviyorum.", "Geçen yaz Paris''e gittik."]', '["journey", "tour", "voyage"]', '["vacation", "hobby"]', true),
('weather', '/ˈweðər/', 'noun', 'A2', '["hava durumu"]', '["the state of the atmosphere at a particular time"]', '["The weather is nice today.", "What is the weather like?"]', '["Bugün hava güzel.", "Hava nasıl?"]', '["climate", "conditions"]', '["nature", "daily"]', true),
('restaurant', '/ˈrestərɑːnt/', 'noun', 'A2', '["restoran", "lokanta"]', '["a place where meals are prepared and served"]', '["Let''s go to a restaurant.", "This restaurant has great food."]', '["Bir restorana gidelim.", "Bu restoranın yemekleri harika."]', '["eatery", "cafe", "diner"]', '["food", "place"]', true),
('beautiful', '/ˈbjuːtɪfəl/', 'adjective', 'A2', '["güzel", "hoş"]', '["pleasing to the senses or mind"]', '["What a beautiful sunset!", "She is very beautiful."]', '["Ne güzel bir gün batımı!", "O çok güzel."]', '["gorgeous", "pretty", "lovely"]', '["appearance", "positive"]', true),
('important', '/ɪmˈpɔːrtənt/', 'adjective', 'A2', '["önemli"]', '["of great significance or value"]', '["This is an important meeting.", "Education is important."]', '["Bu önemli bir toplantı.", "Eğitim önemlidir."]', '["significant", "crucial", "vital"]', '["priority", "value"]', true),
('weekend', '/ˈwiːkend/', 'noun', 'A2', '["hafta sonu"]', '["Saturday and Sunday"]', '["What are you doing this weekend?", "I relax on weekends."]', '["Bu hafta sonu ne yapıyorsun?", "Hafta sonları dinlenirim."]', '["Saturday and Sunday"]', '["time", "leisure"]', true),
('breakfast', '/ˈbrekfəst/', 'noun', 'A2', '["kahvaltı"]', '["the first meal of the day"]', '["I had eggs for breakfast.", "Breakfast is ready."]', '["Kahvaltıda yumurta yedim.", "Kahvaltı hazır."]', '["morning meal", "brunch"]', '["food", "daily"]', true),
('exercise', '/ˈeksərsaɪz/', 'noun', 'A2', '["egzersiz", "spor"]', '["physical activity to stay healthy"]', '["Exercise is good for health.", "I exercise every morning."]', '["Egzersiz sağlık için iyidir.", "Her sabah egzersiz yaparım."]', '["workout", "training", "fitness"]', '["health", "sport"]', true)
ON CONFLICT (word) DO NOTHING;

-- B1 Level Words (Intermediate)
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr, synonyms, antonyms, tags, is_common) VALUES
('achieve', '/əˈtʃiːv/', 'verb', 'B1', '["başarmak", "elde etmek"]', '["to successfully complete something or reach a goal"]', '["She achieved her dreams.", "You can achieve anything with hard work."]', '["Hayallerine ulaştı.", "Çok çalışarak her şeyi başarabilirsin."]', '["accomplish", "attain", "reach"]', '["fail", "lose"]', '["success", "goal"]', true),
('experience', '/ɪkˈspɪriəns/', 'noun', 'B1', '["deneyim", "tecrübe"]', '["knowledge or skill gained through doing something"]', '["I have 5 years of experience.", "It was a great experience."]', '["5 yıllık deneyimim var.", "Harika bir deneyimdi."]', '["knowledge", "expertise", "skill"]', '["inexperience"]', '["career", "life"]', true),
('decision', '/dɪˈsɪʒən/', 'noun', 'B1', '["karar"]', '["a choice that you make after thinking"]', '["I made a difficult decision.", "What is your decision?"]', '["Zor bir karar verdim.", "Kararın ne?"]', '["choice", "resolution", "verdict"]', '["indecision"]', '["thinking", "choice"]', true),
('improve', '/ɪmˈpruːv/', 'verb', 'B1', '["geliştirmek", "iyileştirmek"]', '["to make or become better"]', '["I want to improve my English.", "The situation is improving."]', '["İngilizcemi geliştirmek istiyorum.", "Durum düzeliyor."]', '["enhance", "develop", "upgrade"]', '["worsen", "deteriorate"]', '["development", "progress"]', true),
('knowledge', '/ˈnɒlɪdʒ/', 'noun', 'B1', '["bilgi"]', '["facts, information, and skills acquired through experience or education"]', '["Knowledge is power.", "She has great knowledge."]', '["Bilgi güçtür.", "Onun büyük bir bilgisi var."]', '["information", "understanding", "wisdom"]', '["ignorance"]', '["education", "learning"]', true),
('success', '/səkˈses/', 'noun', 'B1', '["başarı"]', '["the achieving of desired results"]', '["Hard work leads to success.", "I wish you success."]', '["Çok çalışmak başarıya götürür.", "Sana başarılar diliyorum."]', '["achievement", "triumph", "victory"]', '["failure"]', '["goal", "career"]', true),
('communicate', '/kəˈmjuːnɪkeɪt/', 'verb', 'B1', '["iletişim kurmak"]', '["to share or exchange information, ideas, or feelings"]', '["We need to communicate better.", "He communicates well in English."]', '["Daha iyi iletişim kurmalıyız.", "İngilizce iyi iletişim kuruyor."]', '["convey", "express", "share"]', '[]', '["social", "language"]', true),
('recommend', '/ˌrekəˈmend/', 'verb', 'B1', '["önermek", "tavsiye etmek"]', '["to suggest something as good or suitable"]', '["I recommend this book.", "Can you recommend a restaurant?"]', '["Bu kitabı öneriyorum.", "Bir restoran önerebilir misin?"]', '["suggest", "advise", "propose"]', '["discourage"]', '["advice", "suggestion"]', true)
ON CONFLICT (word) DO NOTHING;

-- B2 Level Words (Upper-Intermediate)
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr, synonyms, antonyms, tags, is_common) VALUES
('significant', '/sɪɡˈnɪfɪkənt/', 'adjective', 'B2', '["önemli", "anlamlı"]', '["important or large enough to have an effect"]', '["This is a significant discovery.", "There was a significant increase."]', '["Bu önemli bir keşif.", "Önemli bir artış oldu."]', '["important", "major", "notable"]', '["insignificant", "minor"]', '["importance", "impact"]', true),
('comprehensive', '/ˌkɒmprɪˈhensɪv/', 'adjective', 'B2', '["kapsamlı", "geniş"]', '["including all or nearly all elements or aspects"]', '["We need a comprehensive plan.", "This is a comprehensive study."]', '["Kapsamlı bir plana ihtiyacımız var.", "Bu kapsamlı bir çalışma."]', '["complete", "thorough", "extensive"]', '["limited", "narrow"]', '["detail", "complete"]', true),
('collaborate', '/kəˈlæbəreɪt/', 'verb', 'B2', '["iş birliği yapmak"]', '["to work together with someone to produce something"]', '["We need to collaborate on this project.", "They collaborated with experts."]', '["Bu projede iş birliği yapmalıyız.", "Uzmanlarla iş birliği yaptılar."]', '["cooperate", "partner", "team up"]', '["compete"]', '["teamwork", "business"]', true),
('innovative', '/ˈɪnəveɪtɪv/', 'adjective', 'B2', '["yenilikçi"]', '["introducing new ideas or methods"]', '["This is an innovative approach.", "The company is very innovative."]', '["Bu yenilikçi bir yaklaşım.", "Şirket çok yenilikçi."]', '["creative", "original", "inventive"]', '["traditional", "conventional"]', '["technology", "business"]', true),
('perspective', '/pərˈspektɪv/', 'noun', 'B2', '["bakış açısı", "perspektif"]', '["a particular way of viewing things"]', '["From my perspective, it is fine.", "We need a different perspective."]', '["Benim bakış açıma göre, sorun yok.", "Farklı bir bakış açısına ihtiyacımız var."]', '["viewpoint", "outlook", "standpoint"]', '[]', '["thinking", "opinion"]', true),
('sustainable', '/səˈsteɪnəbl/', 'adjective', 'B2', '["sürdürülebilir"]', '["able to continue over a long time"]', '["We need sustainable energy.", "This is a sustainable solution."]', '["Sürdürülebilir enerjiye ihtiyacımız var.", "Bu sürdürülebilir bir çözüm."]', '["maintainable", "viable", "eco-friendly"]', '["unsustainable"]', '["environment", "future"]', true),
('acknowledge', '/əkˈnɒlɪdʒ/', 'verb', 'B2', '["kabul etmek", "onaylamak"]', '["to accept or admit the existence of something"]', '["I acknowledge my mistake.", "She acknowledged his contribution."]', '["Hatamı kabul ediyorum.", "Onun katkısını kabul etti."]', '["accept", "admit", "recognize"]', '["deny", "ignore"]', '["communication", "honesty"]', true),
('substantial', '/səbˈstænʃəl/', 'adjective', 'B2', '["önemli", "büyük"]', '["of considerable importance, size, or worth"]', '["There was a substantial improvement.", "We made substantial progress."]', '["Önemli bir gelişme oldu.", "Büyük ilerleme kaydettik."]', '["significant", "considerable", "large"]', '["insignificant", "small"]', '["amount", "size"]', true)
ON CONFLICT (word) DO NOTHING;

-- C1 Level Words (Advanced)
INSERT INTO words (word, phonetic, part_of_speech, level, meanings_tr, definitions_en, examples_en, examples_tr, synonyms, antonyms, tags, is_common) VALUES
('ambiguous', '/æmˈbɪɡjuəs/', 'adjective', 'C1', '["belirsiz", "çift anlamlı"]', '["having more than one possible meaning"]', '["The message was ambiguous.", "Avoid ambiguous language."]', '["Mesaj belirsizdi.", "Belirsiz dilden kaçının."]', '["unclear", "vague", "equivocal"]', '["clear", "unambiguous"]', '["language", "communication"]', true),
('scrutinize', '/ˈskruːtənaɪz/', 'verb', 'C1', '["incelemek", "gözden geçirmek"]', '["to examine something very carefully"]', '["The auditors scrutinized the accounts.", "She scrutinized every detail."]', '["Denetçiler hesapları inceledi.", "Her detayı gözden geçirdi."]', '["examine", "inspect", "analyze"]', '["ignore", "overlook"]', '["analysis", "research"]', true),
('meticulous', '/məˈtɪkjələs/', 'adjective', 'C1', '["titiz", "dikkatli"]', '["showing great attention to detail"]', '["She is meticulous in her work.", "The research was meticulous."]', '["İşinde çok titiz.", "Araştırma titizlikle yapıldı."]', '["careful", "thorough", "precise"]', '["careless", "sloppy"]', '["quality", "work"]', true),
('profound', '/prəˈfaʊnd/', 'adjective', 'C1', '["derin", "köklü"]', '["very great or intense; having deep meaning"]', '["It had a profound impact.", "His words were profound."]', '["Derin bir etki bıraktı.", "Sözleri çok derindi."]', '["deep", "intense", "significant"]', '["superficial", "shallow"]', '["meaning", "impact"]', true),
('eloquent', '/ˈeləkwənt/', 'adjective', 'C1', '["etkili konuşan", "güzel söyleyen"]', '["fluent or persuasive in speaking or writing"]', '["She gave an eloquent speech.", "He is an eloquent writer."]', '["Etkili bir konuşma yaptı.", "O, etkili bir yazar."]', '["articulate", "fluent", "expressive"]', '["inarticulate"]', '["speech", "writing"]', true),
('pragmatic', '/præɡˈmætɪk/', 'adjective', 'C1', '["pragmatik", "pratik"]', '["dealing with things sensibly and realistically"]', '["We need a pragmatic approach.", "She is very pragmatic."]', '["Pragmatik bir yaklaşıma ihtiyacımız var.", "O çok pratik düşünür."]', '["practical", "realistic", "sensible"]', '["idealistic", "impractical"]', '["thinking", "business"]', true),
('unprecedented', '/ʌnˈpresɪdentɪd/', 'adjective', 'C1', '["emsalsiz", "benzeri görülmemiş"]', '["never done or known before"]', '["This is unprecedented.", "We face unprecedented challenges."]', '["Bu emsalsiz.", "Benzeri görülmemiş zorluklarla karşı karşıyayız."]', '["unparalleled", "unique", "exceptional"]', '["common", "usual"]', '["rare", "unique"]', true),
('resilient', '/rɪˈzɪliənt/', 'adjective', 'C1', '["dayanıklı", "esnek"]', '["able to recover quickly from difficulties"]', '["Children are resilient.", "We need to be resilient."]', '["Çocuklar dayanıklıdır.", "Dayanıklı olmalıyız."]', '["tough", "strong", "adaptable"]', '["fragile", "weak"]', '["strength", "personality"]', true)
ON CONFLICT (word) DO NOTHING;

-- =============================================================================
-- NEWS SAMPLE DATA
-- =============================================================================

-- Insert sample news
INSERT INTO news (slug, image, published_at, read_time_minutes, category_id, is_published, views, likes, bookmarks) VALUES
('tech-innovation-2025', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800', NOW() - INTERVAL '1 day', 5, (SELECT id FROM news_categories WHERE slug = 'technology'), true, 1250, 89, 45),
('global-climate-summit', 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800', NOW() - INTERVAL '2 days', 7, (SELECT id FROM news_categories WHERE slug = 'science'), true, 980, 67, 32),
('startup-success-story', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', NOW() - INTERVAL '3 days', 4, (SELECT id FROM news_categories WHERE slug = 'business'), true, 756, 54, 28),
('art-exhibition-london', 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800', NOW() - INTERVAL '4 days', 6, (SELECT id FROM news_categories WHERE slug = 'culture'), true, 543, 41, 19),
('healthy-living-tips', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800', NOW() - INTERVAL '5 days', 5, (SELECT id FROM news_categories WHERE slug = 'lifestyle'), true, 890, 78, 56)
ON CONFLICT (slug) DO NOTHING;

-- Insert news levels (A1, A2, B1, B2 versions)
INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'B1',
    'Tech Innovation Shapes Future',
    'New technologies are changing how we live and work',
    'Discover the latest technological innovations that are transforming industries around the world.',
    E'Technology continues to evolve at a rapid pace, bringing new innovations that change our daily lives. From artificial intelligence to renewable energy, these advances are shaping the future of humanity.\n\nArtificial intelligence is now being used in healthcare, education, and business. Doctors use AI to diagnose diseases more accurately. Teachers use AI tools to personalize learning for students. Companies use AI to improve customer service and make better decisions.\n\nRenewable energy is also growing fast. Solar panels and wind turbines are becoming more efficient and affordable. Many countries are investing in clean energy to reduce pollution and fight climate change.\n\nThe future looks bright as more innovations emerge. Young engineers and scientists are working on solutions to global problems. Technology will continue to play an important role in making our world better.',
    '["artificial intelligence", "renewable energy", "innovation", "technology", "climate change"]',
    '[{"question": "What areas use AI according to the article?", "answer": "Healthcare, education, and business"}, {"question": "Why are countries investing in renewable energy?", "answer": "To reduce pollution and fight climate change"}]',
    180
FROM news n WHERE n.slug = 'tech-innovation-2025'
ON CONFLICT DO NOTHING;

INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'A2',
    'New Technology is Changing Our World',
    'Technology helps us every day',
    'Learn about new technology that is making life better.',
    E'Technology is changing our world. Every day, new inventions make our lives easier and better.\n\nComputers and phones help us talk to friends far away. We can send messages and make video calls. This is very useful for families who live in different countries.\n\nDoctors use technology to help sick people. They have special machines that can find problems in our bodies. This helps doctors give better treatment.\n\nWe also have new ways to make energy. Solar panels use sunlight to make electricity. Wind turbines use wind. These are good for the environment because they don''t make pollution.\n\nIn the future, technology will continue to help us. Scientists are working on new ideas every day. The world is becoming a better place because of technology.',
    '["technology", "computers", "doctors", "solar panels", "environment"]',
    '[{"question": "How do we talk to friends far away?", "answer": "With computers and phones"}, {"question": "What do solar panels use to make electricity?", "answer": "Sunlight"}]',
    130
FROM news n WHERE n.slug = 'tech-innovation-2025'
ON CONFLICT DO NOTHING;

INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'B1',
    'World Leaders Meet for Climate Summit',
    'Important decisions about our planet''s future',
    'Leaders from around the world gathered to discuss climate change solutions.',
    E'World leaders from over 150 countries met this week for an important climate summit. The meeting focused on finding solutions to global warming and environmental problems.\n\nThe summit took place in Paris, where leaders discussed new goals for reducing carbon emissions. Many countries promised to use more renewable energy, such as solar and wind power. They also agreed to protect forests and oceans.\n\n"We must act now," said the summit''s host. "The future of our planet depends on the decisions we make today."\n\nYoung climate activists also attended the summit. They called for faster action to protect the environment. "We are the generation that will live with the consequences," one young activist said.\n\nThe summit ended with new agreements to reduce pollution and invest in green technology. Leaders plan to meet again next year to review progress.',
    '["climate summit", "global warming", "renewable energy", "carbon emissions", "environment"]',
    '[{"question": "How many countries participated in the summit?", "answer": "Over 150 countries"}, {"question": "What did young activists call for?", "answer": "Faster action to protect the environment"}]',
    165
FROM news n WHERE n.slug = 'global-climate-summit'
ON CONFLICT DO NOTHING;

INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'B1',
    'Young Entrepreneur Builds Successful Startup',
    'A story of hard work and innovation',
    'A young entrepreneur shares the journey of building a successful tech startup.',
    E'Sarah Chen was just 24 years old when she started her technology company. Today, her startup is worth over $50 million and employs 200 people.\n\n"I always knew I wanted to create something meaningful," Sarah says. "Technology gives us the power to solve real problems."\n\nSarah''s company develops software that helps small businesses manage their finances. The idea came from watching her parents struggle with accounting for their restaurant.\n\n"Small businesses often can''t afford expensive software," she explains. "We made something simple and affordable."\n\nThe journey wasn''t easy. Sarah worked long hours and faced many challenges. She was rejected by dozens of investors before finding someone who believed in her vision.\n\n"Failure is part of success," she advises young entrepreneurs. "Don''t give up when things get difficult. Learn from every mistake."\n\nSarah''s story inspires many young people who dream of starting their own businesses.',
    '["entrepreneur", "startup", "technology", "business", "success"]',
    '[{"question": "How old was Sarah when she started her company?", "answer": "24 years old"}, {"question": "What problem does her software solve?", "answer": "It helps small businesses manage their finances"}]',
    175
FROM news n WHERE n.slug = 'startup-success-story'
ON CONFLICT DO NOTHING;

INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'B1',
    'Modern Art Exhibition Opens in London',
    'A celebration of contemporary creativity',
    'The Tate Modern opens a new exhibition featuring works from artists around the world.',
    E'The Tate Modern museum in London has opened an exciting new exhibition featuring modern art from around the world. The exhibition includes paintings, sculptures, and digital art from over 50 international artists.\n\n"This exhibition celebrates creativity and diversity," said the museum director. "Art helps us understand different cultures and perspectives."\n\nVisitors can see works that explore themes of identity, technology, and the environment. One popular piece is an interactive installation that uses artificial intelligence to create unique patterns based on visitors'' movements.\n\n"I''ve never seen anything like this before," said one visitor. "It makes you think about the relationship between humans and technology."\n\nThe exhibition also features traditional techniques alongside modern methods. This combination shows how art continues to evolve while honoring its history.\n\nThe exhibition will be open until March and is expected to attract thousands of visitors from around the world.',
    '["art exhibition", "modern art", "creativity", "museum", "culture"]',
    '[{"question": "Where is the exhibition taking place?", "answer": "At the Tate Modern museum in London"}, {"question": "How many international artists are featured?", "answer": "Over 50 artists"}]',
    170
FROM news n WHERE n.slug = 'art-exhibition-london'
ON CONFLICT DO NOTHING;

INSERT INTO news_levels (news_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    n.id,
    'A2',
    'Tips for a Healthy Life',
    'Simple ways to feel better every day',
    'Easy tips to help you live a healthier and happier life.',
    E'Do you want to feel healthier and happier? Here are some simple tips that can help you every day.\n\nFirst, drink lots of water. Water is very important for your body. Try to drink 8 glasses every day.\n\nSecond, eat fruits and vegetables. They give your body vitamins and energy. Try to eat 5 portions every day.\n\nThird, exercise regularly. You don''t need to go to a gym. Walking, dancing, or playing sports are all good exercise. Try to move your body for 30 minutes every day.\n\nFourth, sleep well. Adults need 7-8 hours of sleep every night. Good sleep helps your brain and body recover.\n\nFifth, spend time with friends and family. Social connections are important for mental health. Call a friend or visit your family when you can.\n\nFinally, take breaks from your phone and computer. Go outside and enjoy nature. Fresh air is good for your health.\n\nSmall changes can make a big difference. Start today and feel the benefits!',
    '["healthy", "water", "exercise", "sleep", "fruits"]',
    '[{"question": "How many glasses of water should you drink daily?", "answer": "8 glasses"}, {"question": "How many hours of sleep do adults need?", "answer": "7-8 hours"}]',
    180
FROM news n WHERE n.slug = 'healthy-living-tips'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STORIES SAMPLE DATA
-- =============================================================================

-- Insert sample stories
INSERT INTO stories (slug, image, published_at, read_time_minutes, category_id, is_published, views, likes, bookmarks) VALUES
('the-magic-garden', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800', NOW() - INTERVAL '1 day', 8, (SELECT id FROM story_categories WHERE slug = 'fantasy'), true, 2340, 189, 156),
('city-of-dreams', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', NOW() - INTERVAL '2 days', 10, (SELECT id FROM story_categories WHERE slug = 'adventure'), true, 1890, 145, 98),
('the-last-letter', 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800', NOW() - INTERVAL '3 days', 6, (SELECT id FROM story_categories WHERE slug = 'romance'), true, 3210, 267, 234)
ON CONFLICT (slug) DO NOTHING;

-- Insert story levels
INSERT INTO story_levels (story_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    s.id,
    'A2',
    'The Magic Garden',
    'A story about friendship and wonder',
    'A young girl discovers a magical garden hidden behind her grandmother''s house.',
    E'Emma loved visiting her grandmother''s house in the countryside. The old house had many rooms and a big garden full of flowers.\n\nOne sunny afternoon, Emma was playing in the garden when she noticed a small door in the stone wall. The door was covered with ivy, and she had never seen it before.\n\n"What''s behind this door?" Emma wondered.\n\nShe pushed the door, and it opened with a soft creak. Behind it was the most beautiful garden she had ever seen. The flowers were glowing with soft colors—pink, blue, and gold. Butterflies danced in the air, and a small stream flowed through the middle.\n\n"Welcome, Emma," said a gentle voice.\n\nEmma turned around and saw a tiny fairy sitting on a mushroom. The fairy had silver wings and a kind smile.\n\n"This is the Magic Garden," the fairy explained. "Only those with kind hearts can find it."\n\nEmma spent the whole afternoon in the garden, playing with the fairy and learning about the magical creatures. When the sun began to set, she promised to come back.\n\nFrom that day on, Emma visited the Magic Garden whenever she stayed at her grandmother''s house. It was her special secret.',
    '["magic", "garden", "fairy", "flowers", "grandmother"]',
    '[{"question": "What did Emma find in the stone wall?", "answer": "A small door covered with ivy"}, {"question": "Who welcomed Emma to the garden?", "answer": "A tiny fairy with silver wings"}]',
    220
FROM stories s WHERE s.slug = 'the-magic-garden'
ON CONFLICT DO NOTHING;

INSERT INTO story_levels (story_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    s.id,
    'B1',
    'City of Dreams',
    'A journey of hope and discovery',
    'A young man leaves his small town to follow his dreams in the big city.',
    E'Marco had always dreamed of becoming a musician. In his small village in Italy, everyone knew him as the boy who played guitar on the church steps every Sunday.\n\nOne day, Marco decided it was time to follow his dreams. He packed his guitar and a small bag of clothes, said goodbye to his mother, and took the train to Rome.\n\nThe city was overwhelming at first. The streets were crowded, the buildings were tall, and everyone seemed to be in a hurry. Marco felt small and alone.\n\nFor weeks, he played his guitar in the streets, hoping someone would notice his talent. He slept in cheap hostels and ate simple meals. Some days, he wondered if he had made a mistake.\n\nThen, one evening, everything changed. A well-dressed woman stopped to listen to him play. When he finished, she handed him a business card.\n\n"I own a jazz club," she said. "You have real talent. Come play for us tomorrow night."\n\nMarco''s heart raced with excitement. That night at the jazz club was the beginning of his career. People loved his music, and soon he was playing at venues across the city.\n\nYears later, Marco often thought about his journey. He learned that dreams don''t come easy—they require courage, persistence, and a willingness to face uncertainty. But for those who don''t give up, the city of dreams always has room.',
    '["dreams", "music", "journey", "persistence", "talent"]',
    '[{"question": "What was Marco''s dream?", "answer": "To become a musician"}, {"question": "How did Marco get his big break?", "answer": "A woman who owned a jazz club discovered him playing in the street"}]',
    280
FROM stories s WHERE s.slug = 'city-of-dreams'
ON CONFLICT DO NOTHING;

INSERT INTO story_levels (story_id, level, title, subtitle, summary, content_text, key_phrases, comprehension_questions, word_count)
SELECT 
    s.id,
    'B1',
    'The Last Letter',
    'A touching story about love and second chances',
    'An old letter brings two people together after years apart.',
    E'The letter arrived on a cold December morning. Anna recognized the handwriting immediately—it was David''s, the man she had loved thirty years ago.\n\nWith trembling hands, she opened the envelope. The paper was old and yellowed.\n\n"My dearest Anna," the letter began. "If you are reading this, it means the letter finally found its way to you. I wrote it the day before I left for America. I gave it to my mother to mail, but I now know she never sent it."\n\nAnna''s eyes filled with tears as she read on.\n\n"I want you to know that I loved you then, and I have never stopped loving you. I didn''t leave because I wanted to. My father made me go. He said we were too young, that I needed to build a career first. I wrote to you many times, but you never replied. Now I understand why."\n\nDavid explained that he had recently discovered the unmailed letters in his mother''s belongings after she passed away. He had spent months trying to find Anna''s current address.\n\n"I am returning to England next week," the letter concluded. "If you still remember me, if there is any part of you that wants to see me again, please meet me at the old café on December 20th at 3 PM."\n\nAnna looked at the calendar. December 20th was tomorrow.\n\nThe next afternoon, she walked into the café. And there he was, sitting by the window, older but with the same kind eyes she remembered.\n\n"You came," David whispered.\n\n"I came," Anna replied, sitting down across from him. "I never stopped loving you either."\n\nSometimes, the best stories are the ones that begin again.',
    '["love", "letter", "reunion", "memories", "second chance"]',
    '[{"question": "Why did David leave for America?", "answer": "His father made him go"}, {"question": "Where did David ask Anna to meet him?", "answer": "At the old café on December 20th at 3 PM"}]',
    320
FROM stories s WHERE s.slug = 'the-last-letter'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- LINK WORDS TO NEWS/STORIES (Junction Tables)
-- =============================================================================

-- Link words to tech news
INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 1, true
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'innovative'
WHERE n.slug = 'tech-innovation-2025' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 2, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'sustainable'
WHERE n.slug = 'tech-innovation-2025' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 3, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'improve'
WHERE n.slug = 'tech-innovation-2025' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Link words to climate news
INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 1, true
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'environment'
WHERE n.slug = 'global-climate-summit' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 2, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'significant'
WHERE n.slug = 'global-climate-summit' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Link words to startup news
INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 1, true
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'success'
WHERE n.slug = 'startup-success-story' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 2, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'achieve'
WHERE n.slug = 'startup-success-story' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 3, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'experience'
WHERE n.slug = 'startup-success-story' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Link words to art news
INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 1, true
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'beautiful'
WHERE n.slug = 'art-exhibition-london' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 2, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'perspective'
WHERE n.slug = 'art-exhibition-london' AND nl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Link words to health news
INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 1, true
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'exercise'
WHERE n.slug = 'healthy-living-tips' AND nl.level = 'A2'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 2, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'water'
WHERE n.slug = 'healthy-living-tips' AND nl.level = 'A2'
ON CONFLICT DO NOTHING;

INSERT INTO news_words (news_level_id, word_id, display_order, is_highlighted)
SELECT nl.id, w.id, 3, false
FROM news_levels nl
JOIN news n ON nl.news_id = n.id
JOIN words w ON w.word = 'important'
WHERE n.slug = 'healthy-living-tips' AND nl.level = 'A2'
ON CONFLICT DO NOTHING;

-- Link words to magic garden story
INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 1, true
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'beautiful'
WHERE s.slug = 'the-magic-garden' AND sl.level = 'A2'
ON CONFLICT DO NOTHING;

INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 2, false
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'discover'
WHERE s.slug = 'the-magic-garden' AND sl.level = 'A2'
ON CONFLICT DO NOTHING;

-- Link words to city of dreams story
INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 1, true
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'achieve'
WHERE s.slug = 'city-of-dreams' AND sl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 2, false
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'experience'
WHERE s.slug = 'city-of-dreams' AND sl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 3, false
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'success'
WHERE s.slug = 'city-of-dreams' AND sl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Link words to last letter story
INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 1, true
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'decision'
WHERE s.slug = 'the-last-letter' AND sl.level = 'B1'
ON CONFLICT DO NOTHING;

INSERT INTO story_words (story_level_id, word_id, display_order, is_highlighted)
SELECT sl.id, w.id, 2, false
FROM story_levels sl
JOIN stories s ON sl.story_id = s.id
JOIN words w ON w.word = 'communicate'
WHERE s.slug = 'the-last-letter' AND sl.level = 'B1'
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Sample data inserted successfully!' as status;
