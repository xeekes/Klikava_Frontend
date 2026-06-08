import InfoPage from "./InfoPage";
import "./InfoPage.scss";

export const AboutPage = () => (
  <InfoPage
    eyebrow="Company"
    title="About KlikAVA"
    actions={[
      { to: "/catalog", label: "Browse catalog" },
      { to: "/sell", label: "Become a seller" },
    ]}
  >
    <p>
      KlikAVA is a marketplace focused on affordable products, fast discovery,
      and a simple shopping experience inspired by modern global e-commerce
      platforms.
    </p>
    <p>
      This project is a frontend diploma implementation with mock data, local
      storage, and a complete customer journey from search to checkout.
    </p>
  </InfoPage>
);

export const SellPage = () => (
  <InfoPage
    eyebrow="Partners"
    title="Sell on KlikAVA"
    actions={[
      { to: "/profile/personal-info", label: "Account for sellers" },
      { to: "/blog", label: "Read seller blog" },
    ]}
  >
    <p>
      Open your store on KlikAVA, upload products, manage orders, and reach
      customers through categories, search, and promotional placements.
    </p>
    <ul>
      <li>Simple onboarding for new sellers</li>
      <li>Analytics and order management tools</li>
      <li>Promotions during sales calendar events</li>
    </ul>
  </InfoPage>
);

export const BlogPage = () => (
  <InfoPage eyebrow="Blog" title="Blog for sellers">
    <p>
      Practical guides for sellers: product photography, pricing, delivery
      optimization, and seasonal promotions.
    </p>
    <p>
      Latest topics: how to prepare for the spring sales calendar, improve
      conversion on discounted items, and build repeat customers.
    </p>
  </InfoPage>
);

export const SupportLandingPage = () => (
  <InfoPage
    eyebrow="Help"
    title="Support chat"
    actions={[
      { to: "/profile/support", label: "Open profile support" },
      { to: "/profile/chat", label: "Go to chat" },
    ]}
  >
    <p>
      Need help with an order, payment, or delivery? Contact our support team
      through chat or send a detailed request from your profile.
    </p>
  </InfoPage>
);

export const CalendarPage = () => (
  <InfoPage
    eyebrow="Promotions"
    title="Sales Calendar"
    actions={[
      { to: "/discounts", label: "View discounts" },
      { to: "/top-products", label: "Top products" },
    ]}
  >
    <p>Upcoming sales events on KlikAVA:</p>
    <ul>
      <li>Spring Sale — up to 25% off home and comfort</li>
      <li>Tech Week — phones, accessories, and gadgets</li>
      <li>Summer Clearance — best deals across categories</li>
    </ul>
  </InfoPage>
);
