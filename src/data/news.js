// Mock news data with multiple difficulty levels
export const newsData = [
    {
        id: 1,
        slug: "ai-technology-2024",
        category: "Teknoloji",
        categoryEn: "Technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        publishedAt: "2024-12-15",
        readTime: 5,
        views: 2400,
        likes: 156,
        levels: {
            A1: {
                title: "Computers Are Getting Smarter",
                content: `Computers are learning new things. They can now talk like people. They can write stories. They can make pictures.

Many companies make smart computers. Google and Microsoft are big companies. They work on this technology.

Smart computers help people. They can answer questions. They can translate languages. Students use them for homework.

Some people are worried. They think computers will take jobs. But many experts say computers will create new jobs too.

The future is exciting. Computers will do more things. We will use them every day. Technology changes our lives.`,
                newWords: ["computer", "smart", "technology", "company", "translate", "future", "expert", "create"]
            },
            A2: {
                title: "Artificial Intelligence Becomes Smarter Every Day",
                content: `Artificial Intelligence, or AI, is improving quickly. Tech companies are making AI systems that can understand and respond like humans. These systems can write emails, create art, and even code programs.

Big tech companies like Google, Microsoft, and OpenAI are leading this revolution. They invest billions of dollars in AI research. Their goal is to make AI helpful for everyone.

AI is already changing how we work. Many businesses use AI assistants. These assistants can schedule meetings, answer customer questions, and analyze data. This saves time and money.

However, there are concerns about AI. Some worry about job losses. Others worry about privacy. Experts say we need rules to keep AI safe and fair.

Despite the challenges, AI offers many benefits. It can help doctors diagnose diseases. It can help teachers personalize education. The possibilities are endless.`,
                newWords: ["artificial intelligence", "improve", "respond", "revolution", "invest", "research", "assistant", "analyze", "concern", "privacy", "diagnose", "personalize"]
            },
            B1: {
                title: "The AI Revolution: How Machine Learning is Transforming Daily Life",
                content: `Artificial Intelligence has evolved dramatically in recent years, becoming a cornerstone of modern technology. From virtual assistants on our phones to recommendation algorithms on streaming platforms, AI influences countless aspects of our daily routines.

Major technology corporations are in a fierce competition to develop the most advanced AI systems. Companies like Google, Microsoft, Meta, and OpenAI are investing unprecedented amounts of capital into research and development. These investments are yielding remarkable results, with AI systems now capable of generating human-like text, creating photorealistic images, and engaging in sophisticated conversations.

The implications for the workforce are significant. While some traditional jobs may become automated, new opportunities are emerging in AI development, maintenance, and oversight. Economists predict that by 2030, AI could contribute trillions of dollars to the global economy.

Nevertheless, concerns about AI safety and ethics persist. Questions about bias in AI systems, data privacy, and the potential misuse of the technology require careful consideration. Governments worldwide are working to establish regulatory frameworks that balance innovation with protection.

The coming years will be crucial in determining how AI shapes our society. With responsible development and thoughtful implementation, AI has the potential to solve complex problems in healthcare, climate science, and education.`,
                newWords: ["evolve", "cornerstone", "algorithm", "streaming", "corporation", "fierce", "unprecedented", "capital", "yield", "photorealistic", "sophisticated", "implication", "automated", "oversight", "economist", "regulatory", "framework", "implementation"]
            },
            B2: {
                title: "Navigating the AI Paradigm Shift: Opportunities and Ethical Considerations",
                content: `The artificial intelligence landscape is undergoing an unprecedented transformation that is fundamentally reshaping industries across the globe. What was once the realm of science fiction has materialized into tangible applications that permeate nearly every sector of the economy, from healthcare diagnostics to financial trading algorithms.

Leading technology conglomerates are engaged in an intense race to achieve artificial general intelligence (AGI) – systems capable of performing any intellectual task that a human can accomplish. This pursuit has attracted astronomical investments, with venture capital flowing into AI startups at record rates. The implications of achieving AGI would be profound, potentially revolutionizing everything from scientific research to creative endeavors.

The integration of AI into the workforce presents a nuanced picture. While automation threatens to displace workers in certain sectors, it simultaneously generates demand for new skill sets. Professionals with expertise in machine learning, data science, and AI ethics are increasingly sought after. Organizations are restructuring their operations to leverage AI capabilities while maintaining human oversight in critical decision-making processes.

Ethical considerations surrounding AI deployment have intensified. Issues such as algorithmic bias, surveillance capabilities, and the potential for autonomous weapons systems demand rigorous scrutiny. The absence of comprehensive international regulations creates a complex governance vacuum that policymakers are scrambling to address.

Looking ahead, the trajectory of AI development will depend significantly on how society navigates these challenges. Collaborative efforts between technologists, ethicists, and policymakers will be essential in ensuring that AI advancement benefits humanity while mitigating potential risks.`,
                newWords: ["paradigm", "permeate", "diagnostics", "conglomerate", "astronomical", "venture capital", "profound", "endeavor", "nuanced", "displace", "leverage", "scrutiny", "governance", "trajectory", "collaborative", "mitigate"]
            },
            C1: {
                title: "The Inexorable March of Artificial Intelligence: A Critical Examination of Societal Implications",
                content: `The proliferation of artificial intelligence technologies represents perhaps the most consequential technological paradigm shift since the industrial revolution. As machine learning algorithms become increasingly sophisticated, they are fundamentally reconfiguring the epistemological foundations upon which our understanding of human cognition and capability rests.

Contemporary AI systems, particularly large language models and generative adversarial networks, have demonstrated capabilities that blur the traditional demarcations between human and machine intelligence. These systems exhibit emergent properties that their creators did not explicitly program, raising profound philosophical questions about the nature of consciousness, creativity, and autonomous decision-making.

The geopolitical ramifications of AI supremacy are substantial. Nation-states are engaged in a strategic competition to achieve technological preeminence, recognizing that AI capabilities will be determinative in shaping the future global order. This competition has precipitated concerns about an AI arms race, with potential implications for international stability and the established frameworks governing warfare.

The socioeconomic reverberations of widespread AI adoption merit careful examination. While productivity gains may generate unprecedented prosperity, the distributional consequences could exacerbate existing inequalities. The transformation of labor markets necessitates a fundamental reconceptualization of education, social safety nets, and the relationship between work and identity in post-industrial societies.

Navigating this technological inflection point demands a multidisciplinary approach that synthesizes insights from computer science, philosophy, economics, and governance. The decisions we make in the coming decade regarding AI development and deployment will reverberate for generations, making it imperative that we proceed with both ambition and circumspection.`,
                newWords: ["inexorable", "proliferation", "paradigm shift", "epistemological", "cognition", "demarcation", "emergent", "geopolitical", "preeminence", "determinative", "precipitate", "reverberation", "distributional", "exacerbate", "reconceptualization", "inflection point", "synthesize", "circumspection"]
            }
        }
    },
    {
        id: 2,
        slug: "climate-change-solutions",
        category: "Çevre",
        categoryEn: "Environment",
        image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800",
        publishedAt: "2024-12-14",
        readTime: 6,
        views: 1850,
        likes: 203,
        levels: {
            A1: {
                title: "The Earth is Getting Warmer",
                content: `Our planet is getting warmer. This is called climate change. It happens because of pollution.

Cars and factories make pollution. This pollution goes into the air. It makes the Earth hot.

When the Earth gets hot, ice melts. Animals lose their homes. Weather becomes strange.

We can help the planet. We can use less energy. We can plant trees. We can recycle.

Many countries are working together. They want to stop climate change. We all need to help.`,
                newWords: ["planet", "climate", "pollution", "factory", "melt", "energy", "recycle", "country"]
            },
            A2: {
                title: "Climate Change: What We Can Do",
                content: `Climate change is one of the biggest problems facing our world today. The average temperature of Earth is rising, causing many changes in weather patterns and ecosystems.

The main cause of climate change is greenhouse gases. These gases come from burning fossil fuels like oil, gas, and coal. Cars, power plants, and factories release these gases into the atmosphere.

The effects of climate change are serious. Polar ice is melting, causing sea levels to rise. Extreme weather events like hurricanes and heat waves are becoming more frequent. Many animal species are endangered.

However, there is hope. Countries around the world are taking action. They are investing in renewable energy like solar and wind power. Many cities are improving public transportation to reduce car emissions.

Individuals can also make a difference. Using less electricity, eating less meat, and recycling are simple ways to help. Every small action counts in the fight against climate change.`,
                newWords: ["temperature", "ecosystem", "greenhouse", "fossil fuel", "atmosphere", "polar", "extreme", "hurricane", "endangered", "renewable", "emission", "individual"]
            },
            B1: {
                title: "Addressing the Climate Crisis: Global Initiatives and Personal Responsibility",
                content: `The climate crisis has emerged as the defining challenge of our generation, demanding unprecedented coordination between governments, corporations, and individuals. Scientific consensus indicates that limiting global warming to 1.5 degrees Celsius above pre-industrial levels is crucial to avoiding the most catastrophic consequences.

The primary driver of climate change remains the emission of greenhouse gases, particularly carbon dioxide and methane. Industrial activities, deforestation, and agricultural practices contribute significantly to these emissions. The concentration of CO2 in the atmosphere has reached levels not seen in millions of years.

Governments worldwide are implementing various strategies to address this challenge. The Paris Agreement, signed by nearly 200 countries, establishes a framework for reducing emissions and supporting climate adaptation. Many nations have committed to achieving net-zero emissions by 2050.

The private sector is also undergoing a significant transformation. Major corporations are setting ambitious sustainability goals and investing in green technologies. The renewable energy sector is experiencing rapid growth, with solar and wind power becoming increasingly cost-competitive with fossil fuels.

Individual actions, while modest in isolation, collectively make a meaningful impact. Reducing consumption, choosing sustainable products, and advocating for climate-friendly policies all contribute to addressing this global challenge.`,
                newWords: ["consensus", "catastrophic", "deforestation", "concentration", "implement", "adaptation", "net-zero", "sector", "sustainability", "cost-competitive", "isolation", "collectively", "advocate"]
            },
            B2: {
                title: "The Climate Imperative: Balancing Economic Development with Environmental Sustainability",
                content: `The intersection of climate science and economic policy presents one of the most complex challenges confronting contemporary society. As empirical evidence of anthropogenic climate change becomes increasingly irrefutable, the imperative for decisive action grows more urgent, even as debates about the most effective strategies continue.

The decarbonization of the global economy requires a fundamental restructuring of energy systems, industrial processes, and consumption patterns. This transition carries significant economic implications, potentially displacing workers in carbon-intensive industries while creating opportunities in emerging green sectors. Managing this transition equitably represents a formidable policy challenge.

Technological innovation offers promising pathways toward sustainability. Advances in renewable energy generation, battery storage, and carbon capture technologies are accelerating. However, the pace of deployment remains insufficient to meet established climate targets, necessitating more aggressive policy interventions.

The political economy of climate action reveals stark disparities. Developing nations, often the least responsible for historical emissions, face disproportionate vulnerabilities to climate impacts. Achieving a just transition requires substantial financial and technological transfers from affluent to developing economies.

Ultimately, addressing climate change demands an unprecedented mobilization of resources and political will. The window for meaningful action is rapidly narrowing, making it essential that stakeholders across all sectors prioritize this existential challenge.`,
                newWords: ["imperative", "intersection", "empirical", "anthropogenic", "irrefutable", "decarbonization", "restructuring", "equitably", "formidable", "deployment", "disparity", "disproportionate", "affluent", "mobilization", "existential"]
            },
            C1: {
                title: "Climate Governance in the Anthropocene: Navigating Systemic Risks and Transformative Adaptation",
                content: `The Anthropocene epoch, characterized by the indelible imprint of human activity on Earth systems, presents governance challenges of unprecedented complexity. Climate change exemplifies the quintessential "wicked problem" – one defined by irreducible uncertainty, contested values, and the inadequacy of conventional problem-solving approaches.

The thermodynamic constraints governing planetary energy balance dictate that without substantial reductions in greenhouse gas concentrations, continued warming is inexorable. Current trajectories place global mean temperature increases well beyond the 1.5-2°C thresholds articulated in international agreements, portending catastrophic disruptions to biophysical and socioeconomic systems.

The political architecture of climate governance reflects the inherent tensions between national sovereignty and the necessity of collective action on global commons. The principle of common but differentiated responsibilities, while ethically compelling, has proven operationally contentious. The inadequacy of voluntary commitment mechanisms has prompted calls for more binding governance frameworks.

Transformative adaptation strategies increasingly acknowledge that incremental adjustments will prove insufficient. Managed retreat from vulnerable coastal areas, fundamental redesign of agricultural systems, and reimagination of urban infrastructure are among the systemic changes that will likely become necessary. These transitions carry profound implications for distributive justice and intergenerational equity.

The epistemic challenges attending climate governance demand new modalities of knowledge production and decision-making under uncertainty. Transdisciplinary approaches that integrate natural and social sciences with local and indigenous knowledge systems offer promising avenues for navigating the complexities of the climate crisis.`,
                newWords: ["Anthropocene", "indelible", "quintessential", "irreducible", "thermodynamic", "inexorable", "trajectory", "articulate", "portend", "sovereignty", "contentious", "incremental", "distributive", "intergenerational", "epistemic", "modality", "transdisciplinary"]
            }
        }
    },
    {
        id: 3,
        slug: "space-exploration-mars",
        category: "Bilim",
        categoryEn: "Science",
        image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800",
        publishedAt: "2024-12-13",
        readTime: 7,
        views: 3200,
        likes: 289,
        levels: {
            A1: {
                title: "Going to Mars",
                content: `People want to go to Mars. Mars is a planet. It is red and far from Earth.

Space companies are building rockets. These rockets are very big. They can carry people.

NASA is a space agency. SpaceX is a company. They work on Mars missions.

Living on Mars is hard. There is no air. It is very cold. People need special suits.

Scientists are excited. They want to explore Mars. Maybe humans will live there someday.`,
                newWords: ["Mars", "planet", "rocket", "mission", "astronaut", "explore", "scientist", "space"]
            },
            A2: {
                title: "The Journey to Mars: Humanity's Next Big Step",
                content: `Mars has fascinated humans for centuries. Now, we are closer than ever to sending people to the Red Planet. Several space agencies and private companies are working on Mars missions.

NASA plans to send astronauts to Mars in the 2030s. The journey will take about seven months. Astronauts will need to bring everything they need to survive, including food, water, and air.

SpaceX, founded by Elon Musk, is also developing Mars rockets. Their Starship rocket is designed to carry many passengers. Musk dreams of creating a colony on Mars.

Living on Mars presents many challenges. The planet has no breathable air. Temperatures can drop to minus 80 degrees Celsius. Radiation from the sun is dangerous without Earth's protective atmosphere.

Despite these challenges, scientists are optimistic. They are developing technologies to produce oxygen and water on Mars. Someday, Mars might become humanity's second home.`,
                newWords: ["fascinate", "century", "agency", "astronaut", "survive", "colony", "breathable", "temperature", "radiation", "protective", "optimistic", "oxygen"]
            },
            B1: {
                title: "Mars Colonization: The Technical and Human Challenges of Interplanetary Settlement",
                content: `The prospect of establishing a permanent human presence on Mars has transitioned from science fiction to an active area of scientific and commercial endeavor. Multiple organizations are now developing the technologies and strategies necessary for interplanetary travel and settlement.

NASA's Artemis program serves as a stepping stone toward Mars, using the Moon as a testing ground for deep space exploration technologies. The agency is developing new spacecraft, propulsion systems, and life support technologies that will eventually enable Mars missions.

Private sector involvement has accelerated the pace of innovation. SpaceX's Starship, designed to be fully reusable, could dramatically reduce the cost of space travel. The company envisions launching dozens of Starships to establish the infrastructure for a self-sustaining Mars colony.

The physiological challenges of extended spaceflight are substantial. Astronauts face muscle atrophy, bone density loss, and radiation exposure during the months-long journey. Psychological factors, including isolation and communication delays with Earth, pose additional concerns.

Establishing a sustainable presence on Mars will require utilizing local resources, a concept known as In-Situ Resource Utilization (ISRU). This includes extracting water from Martian ice and producing oxygen from the carbon dioxide atmosphere. Such technologies will be essential for long-term habitation.`,
                newWords: ["colonization", "interplanetary", "endeavor", "stepping stone", "propulsion", "accelerate", "reusable", "infrastructure", "self-sustaining", "physiological", "atrophy", "sustainable", "in-situ", "extracting", "habitation"]
            },
            B2: {
                title: "The Mars Imperative: Assessing the Feasibility and Implications of Human Settlement",
                content: `The aspiration to extend human civilization beyond Earth has gained considerable momentum in recent years, with Mars emerging as the primary candidate for off-planet settlement. This endeavor, while technologically audacious, is increasingly viewed as both achievable within the coming decades and potentially essential for the long-term survival of our species.

Contemporary Mars exploration relies on a multi-pronged approach combining robotic missions with human spaceflight development. Rovers such as Perseverance are conducting detailed geological surveys, searching for biosignatures that might indicate past or present microbial life. These findings will inform the selection of landing sites for crewed missions.

The engineering challenges associated with Mars transit and surface operations are formidable. Spacecraft must be engineered to withstand the intense radiation environment of deep space, while propulsion systems must be efficient enough to complete the journey within acceptable timeframes. Landing the substantial payloads required for human missions presents additional technical hurdles.

The socioeconomic dimensions of Mars colonization warrant careful consideration. Critics argue that the resources devoted to interplanetary settlement might be better allocated to addressing pressing terrestrial challenges. Proponents counter that the technological spillovers and inspirational value of space exploration justify the investment.

Governance frameworks for extraterrestrial settlements remain largely undefined. Questions regarding property rights, resource extraction, and the applicability of international law in space constitute uncharted legal territory that will require resolution as settlement plans advance.`,
                newWords: ["aspiration", "audacious", "biosignature", "microbial", "formidable", "transit", "payload", "hurdle", "socioeconomic", "terrestrial", "spillover", "extraterrestrial", "applicability", "uncharted", "constitute"]
            },
            C1: {
                title: "Planetary Expansion and the Ontological Transformation of Human Civilization",
                content: `The impending transition of humanity from a single-planet to a multi-planetary species represents an ontological threshold of profound significance. This metamorphosis, should it come to fruition, will fundamentally reconfigure our conception of human identity, societal organization, and our relationship with the cosmos.

The Mars settlement proposition crystallizes divergent philosophical perspectives regarding humanity's civilizational trajectory. Adherents of the "cosmic imperative" paradigm contend that expansion beyond Earth constitutes an evolutionary necessity, providing existential insurance against planetary-scale catastrophes while enabling the flourishing of consciousness throughout the universe.

The technical prerequisites for sustained Martian habitation extend considerably beyond transportation capabilities. The establishment of closed-loop ecological systems capable of recycling waste, regenerating atmosphere, and producing sustenance represents an engineering challenge of unprecedented complexity. Such systems must function reliably for decades with minimal resupply from Earth.

The psychosocial dynamics of isolated interplanetary communities remain largely unexplored. The emergence of distinctly Martian cultural identities, potentially diverging from terrestrial norms, raises questions about the cohesion of transplanetary human civilization. Historical precedents of colonial societies developing autonomous trajectories offer instructive, if imperfect, analogies.

The ethical dimensions of planetary modification warrant rigorous examination. Proposals for terraforming Mars to create Earth-like conditions implicate questions of planetary rights and the value of preserving extraterrestrial environments in their pristine state. These deliberations will shape the ethical framework guiding our expansion into the solar system.`,
                newWords: ["ontological", "metamorphosis", "fruition", "crystallize", "paradigm", "contend", "prerequisite", "closed-loop", "sustenance", "psychosocial", "cohesion", "transplanetary", "precedent", "terraform", "pristine", "deliberation"]
            }
        }
    }
];

// Get news by level
export const getNewsByLevel = (level) => {
    return newsData.map(news => ({
        id: news.id,
        slug: news.slug,
        category: news.category,
        categoryEn: news.categoryEn,
        image: news.image,
        publishedAt: news.publishedAt,
        readTime: news.readTime,
        views: news.views,
        likes: news.likes,
        title: news.levels[level]?.title || news.levels.B1.title,
        content: news.levels[level]?.content || news.levels.B1.content,
        newWords: news.levels[level]?.newWords || news.levels.B1.newWords,
        level: level
    }));
};

// Get single news by id and level
export const getNewsById = (id, level) => {
    const news = newsData.find(n => n.id === parseInt(id) || n.slug === id);
    if (!news) return null;

    return {
        id: news.id,
        slug: news.slug,
        category: news.category,
        categoryEn: news.categoryEn,
        image: news.image,
        publishedAt: news.publishedAt,
        readTime: news.readTime,
        views: news.views,
        likes: news.likes,
        title: news.levels[level]?.title || news.levels.B1.title,
        content: news.levels[level]?.content || news.levels.B1.content,
        newWords: news.levels[level]?.newWords || news.levels.B1.newWords,
        level: level,
        availableLevels: Object.keys(news.levels)
    };
};
