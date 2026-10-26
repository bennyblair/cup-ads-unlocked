export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; text: string }

export type SeoGuide = {
  slug: string
  title: string
  description: string
  eyebrow: string
  h1: string
  intro: string
  blocks: Block[]
  faq: [string, string][]
  cta: { label: string; to: string }
  related: string[]
}

// Inline links use [label](/path) syntax and are rendered as router links.
export const seoGuides: SeoGuide[] = [
  {
    slug: "coffee-cup-advertising-sydney",
    title: "Coffee Cup Advertising Sydney | Café Advertising | CupSpace",
    description:
      "Put your brand on takeaway coffee cups in the Sydney suburbs you choose. CupSpace finds the cafés, handles design, printing and delivery, and adds trackable QR codes.",
    eyebrow: "Café advertising / Sydney",
    h1: "Coffee Cup Advertising in Sydney",
    intro:
      "Your brand, in people's hands, in the suburbs you care about. CupSpace puts your campaign on takeaway coffee cups that local cafés serve every morning. Cafés get their cups free. You get media people carry down the street, into the office and onto the train.",
    blocks: [
      { type: "h2", text: "How café advertising with CupSpace works" },
      {
        type: "ol",
        items: [
          "**Choose your patch.** Tell us the suburbs, the audience and the action you want people to take.",
          "**Approve your cafés.** We find cafés in those suburbs and you approve each one before anything is printed.",
          "**We handle the cups.** CupSpace takes care of cup design, printing and delivery to your approved cafés.",
          "**Serve and measure.** Cups go over the counter. Add an optional QR code or promo code so you can see responses.",
        ],
      },
      { type: "h2", text: "Why coffee cup marketing works locally" },
      {
        type: "ul",
        items: [
          "**It's held, not scrolled past.** Someone holds a coffee cup for the whole time they drink it.",
          "**It's local by design.** Your cups only go to cafés in the suburbs you pick.",
          "**It's trackable.** Across CupSpace campaigns, QR scans have ranged from about 0.5% to 3% of cups. People who don't scan still see your brand.",
          "**It's good for the café.** Free cups take away a regular cost for local cafés, so your brand turns up as something useful.",
        ],
      },
      { type: "h2", text: "Who it suits" },
      {
        type: "p",
        text: "Real estate agents, gyms, health and allied health clinics, local services, new openings, events and any brand that wants to reach a specific Sydney neighbourhood. See [real estate agent marketing ideas](/real-estate-agent-marketing-ideas), [branded promotional coffee cups](/branded-promotional-coffee-cups) and [advertising ideas for small businesses](/small-business-advertising-ideas).",
      },
    ],
    faq: [
      ["Which areas do you cover?", "We can look for cafés in any Sydney suburb you want to reach. Tell us your target area and we'll find cafés there."],
      ["Do I choose the cafés?", "Yes. You approve every café before your campaign starts."],
      ["Do I need to supply artwork?", "No. CupSpace handles cup design, printing and delivery. You can still supply your own brand assets."],
      ["How do I measure results?", "Add a QR code or promo code. Across campaigns, QR scans have run at about 0.5% to 3% of cups, plus brand awareness from everyone else who sees the cup."],
      ["What does it cost the café?", "Nothing. Cafés get the cups free."],
    ],
    cta: { label: "Put your campaign in hand", to: "/advertiser-form" },
    related: ["branded-promotional-coffee-cups", "real-estate-agent-marketing-ideas", "small-business-advertising-ideas"],
  },
  {
    slug: "real-estate-agent-marketing-ideas",
    title: "Real Estate Agent Marketing Ideas: Beyond Letterbox Drops | CupSpace",
    description:
      "Local marketing ideas for real estate agents. Here's how coffee cup advertising compares with letterbox drops and flyers for staying front of mind in your patch.",
    eyebrow: "Guide / Real estate",
    h1: "Real Estate Agent Marketing Ideas for Owning Your Patch",
    intro:
      "Listings come from being known in a suburb. These ideas help you stay front of mind with local homeowners. One of them is your brand on the coffee cups locals buy every morning.",
    blocks: [
      { type: "h2", text: "1. Letterbox drops and flyers" },
      { type: "p", text: "Letterbox drops are a well-established way to reach every home in an area with appraisal offers, recent sales and market updates. They work well when the message is consistent and repeated." },
      { type: "h2", text: "2. Coffee cups at local cafés" },
      { type: "p", text: "Put your face, brand and an appraisal QR code on takeaway cups at cafés in your farm area. CupSpace finds the cafés, you approve each one, and we handle design, printing and delivery. [How coffee cup advertising works](/coffee-cup-advertising-sydney)." },
      { type: "note", text: "Cups vs letterbox drops and flyers" },
      {
        type: "table",
        head: ["", "Letterbox drop / flyer", "Coffee cup"],
        rows: [
          ["Where it's seen", "At home, with the mail", "In the hand, on the street, at work"],
          ["How long it's seen", "However long someone looks at it", "As long as the coffee lasts"],
          ["Targeting", "By delivery area", "By the cafés you choose in the suburb"],
          ["Tracking", "Promo code or QR possible", "QR or promo code (about 0.5% to 3% scans across CupSpace campaigns)"],
          ["Works best", "Direct offers to every home", "Repeated local visibility and brand recall"],
        ],
      },
      { type: "p", text: "Many agents will use both. Cups add a different, everyday touchpoint." },
      { type: "h2", text: "3. Sponsor local events and sport" },
      { type: "p", text: "Junior sport clubs, school fetes and community events put your name in front of the families who live in your farm area. Pick a few that genuinely matter to the suburb and stick with them; consistent support over several seasons tends to be remembered more than a one-off logo on a banner." },
      { type: "h2", text: "4. Share suburb market updates by email and social media" },
      { type: "p", text: "Homeowners like knowing what's happening on their street. A short, regular update on recent sales, auction results and what buyers are asking for gives people a reason to follow you. Keep it local and useful rather than a list of your own listings, and make it easy to request an appraisal." },
      { type: "h2", text: "5. Use signboards and just-sold cards" },
      { type: "p", text: "Signboards and just-sold cards are proof you're active in the area. Drop cards to the neighbours around each sale and keep boards tidy and consistent with the rest of your branding, so every touchpoint reinforces the same name and face." },
      { type: "h2", text: "6. Partner with local businesses" },
      { type: "p", text: "Teaming up with cafés, gyms and other local businesses puts you where locals already spend time. With CupSpace, the cafés serving your cups get them free, so the partnership helps a local business as well as your brand. [See how café advertising works](/coffee-cup-advertising-sydney)." },
    ],
    faq: [
      ["Is coffee cup advertising a replacement for letterbox drops?", "It doesn't have to be. It's another local channel that reaches people out and about instead of at the letterbox."],
      ["Can I target the suburbs I farm?", "Yes. We find cafés in your chosen suburbs and you approve each one."],
      ["What should go on an agent's cup?", "Keep it simple: your name and brand, one clear offer (such as a free appraisal), and a QR code."],
      ["How do I track it?", "Use a campaign-specific QR or promo code."],
    ],
    cta: { label: "Talk to us about your farm area", to: "/advertiser-form" },
    related: ["coffee-cup-advertising-sydney", "small-business-advertising-ideas", "branded-promotional-coffee-cups"],
  },
  {
    slug: "branded-promotional-coffee-cups",
    title: "Branded & Promotional Coffee Cups, Served Free in Local Cafés | CupSpace",
    description:
      "Get your brand printed on coffee cups and served in Sydney cafés. You don't order a pallet of cups. CupSpace handles design, printing and delivery to cafés you approve.",
    eyebrow: "Branded cups / Done for you",
    h1: "Branded and Promotional Coffee Cups, Handed Out for You",
    intro:
      "Want your brand on printed coffee cups? You don't have to buy cups and find a way to hand them out. CupSpace prints your brand on takeaway cups and supplies them free to local cafés, which serve them to their customers.",
    blocks: [
      { type: "h2", text: "How it's different from ordering custom cups" },
      {
        type: "ul",
        items: [
          "**No boxes to store.** Cups go straight to the cafés you approve.",
          "**Built-in distribution.** Every cup goes out with a coffee in your chosen suburbs.",
          "**Done for you.** CupSpace handles cup design, printing and delivery.",
          "**Trackable.** Add a QR or promo code. Across campaigns, scans have run at about 0.5% to 3% of cups.",
        ],
      },
      { type: "note", text: "Want cups for your own café or event? CupSpace runs advertising campaigns, so we don't sell cups. Cafés can [join the network](/cafe-form) and get branded cups free." },
      { type: "h2", text: "Steps" },
      { type: "ol", items: ["Tell us your audience and suburbs.", "Approve the cafés.", "Approve your cup design.", "Cups are printed, delivered and served."] },
      { type: "p", text: "Learn more about [coffee cup advertising in Sydney](/coffee-cup-advertising-sydney)." },
    ],
    faq: [
      ["Do I pay for the cups?", "You pay for the advertising campaign. That covers printing and delivery, and the cafés get the cups free."],
      ["Can I buy custom cups for my own shop?", "We don't sell cups. If you run a café, you can join the network and get free cups."],
      ["Who designs the cup?", "We do, using your brand. You approve the design before it goes to print."],
      ["Where are the cups served?", "At cafés in the suburbs you choose, and you approve each café."],
    ],
    cta: { label: "Start a branded cup campaign", to: "/advertiser-form" },
    related: ["coffee-cup-advertising-sydney", "small-business-advertising-ideas", "real-estate-agent-marketing-ideas"],
  },
  {
    slug: "small-business-advertising-ideas",
    title: "Local & Small Business Advertising Ideas (Sydney Guide) | CupSpace",
    description:
      "Practical advertising ideas for local and small businesses in Sydney, from Google Business Profile and letterbox drops to coffee cup advertising at nearby cafés.",
    eyebrow: "Guide / Local business",
    h1: "Advertising Ideas for Local and Small Businesses",
    intro:
      "Most local businesses don't need to reach everyone. They need to reach people within a few kilometres. These ideas focus on doing exactly that.",
    blocks: [
      { type: "h2", text: "1. Set up your Google Business Profile" },
      { type: "p", text: "Keep your hours, photos and reviews current. It's free and it's where locals look first." },
      { type: "h2", text: "2. Letterbox drops and flyers" },
      { type: "p", text: "Good for direct offers to every home in a set area." },
      { type: "h2", text: "3. Local social media and community groups" },
      { type: "p", text: "Share useful posts in the places your neighbours already gather online." },
      { type: "h2", text: "4. Coffee cup advertising at local cafés" },
      { type: "p", text: "Put your brand on the takeaway cups served in your suburb. CupSpace finds the cafés, you approve each one, and we handle design, printing and delivery. Add a QR code to track responses. Across campaigns, scans have run at about 0.5% to 3% of cups. [See how coffee cup advertising works in Sydney](/coffee-cup-advertising-sydney)." },
      { type: "h2", text: "5. Partner with neighbouring businesses" },
      { type: "p", text: "Cross-promotions, shared events and referral offers." },
      { type: "h2", text: "6. Sponsor local sport and events" },
      { type: "p", text: "Local clubs, school events and street festivals are a straightforward way to show you're part of the community. Choose events your customers actually attend, ask what exposure you'll get (signage, mentions, a stall), and bring a simple offer or QR code so you can tell whether it brought anyone through the door." },
      { type: "h2", text: "7. Track everything" },
      { type: "p", text: "Use a different QR or promo code for each channel so you can see what's working." },
    ],
    faq: [
      ["What's the cheapest way to advertise locally?", "Start with free channels like your Google Business Profile and community groups, then add paid local media."],
      ["How do I know which ads work?", "Give each channel its own QR or promo code."],
      ["Is café advertising only for food businesses?", "No. Any business with local customers can use it, including agents, clinics, gyms, trades and services."],
    ],
    cta: { label: "Explore coffee cup advertising", to: "/coffee-cup-advertising-sydney" },
    related: ["coffee-cup-advertising-sydney", "real-estate-agent-marketing-ideas", "branded-promotional-coffee-cups"],
  },
]
