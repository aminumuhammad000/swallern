// import React from "react";
import styles from "./FAQs.module.css";
import { useState } from "react";

type FAQ = {
  title: string;
  description: string;
  id: number;
};

const faqs: FAQ[] = [
  {
    id: 1,
    title: "What is Swallern?",
    description:
      "Swallern is a modern learning platform designed to help young people learn fast, grow wise, and gain high-demand skills through short, interactive, and gamified courses.",
  },
  {
    id: 2,
    title: "Who is Swallern for?",
    description:
      "Swallern is built for young learners aged 14–35, especially in Africa, who want to grow their skills in tech, design, and entrepreneurship even with limited time or internet access.",
  },
  {
    id: 3,
    title: "What makes Swallern different from other learning platforms?",
    description:
      "Unlike traditional platforms, Swallern uses a mobile-first, gamified, and community-driven approach to make learning fast, fun, and deeply engaging — not overwhelming.",
  },
  {
    id: 4,
    title: "How does Swallern keep learning engaging?",
    description:
      "Through points, badges, quizzes, progress tracking, and live events, Swallern makes every lesson feel like a step forward in a real adventure.",
  },
  {
    id: 5,
    title: "Do I need to pay to use Swallern?",
    description:
      "No! Swallern has a free tier with essential features. You can upgrade to Swallern Pro for personalized learning paths, offline access, exclusive certifications, and priority support.",
  },
  {
    id: 6,
    title: "Can I use Swallern without a strong internet connection?",
    description:
      "Yes. Swallern supports offline access on mobile — you can download lessons and keep learning even when your internet is limited.",
  },
  {
    id: 7,
    title: "What kind of skills can I learn on Swallern?",
    description:
      "Swallern offers curated learning paths in tech (like coding and design), digital skills, productivity, freelancing, and more — all focused on real-world impact.",
  },
  {
    id: 8,
    title: "Will I get a certificate after completing a course?",
    description:
      "Yes. You’ll earn completion certificates when you finish courses or skill tracks. These can help you stand out when applying for jobs or gigs.",
  },
  {
    id: 9,
    title: "Can I contribute content or become a Swallern instructor?",
    description:
      "Absolutely. If you're a creator or educator, you can publish mini-courses through the Swallern Marketplace and earn revenue or gain visibility.",
  },
  {
    id: 10,
    title: "Is Swallern available on mobile?",
    description:
      "Yes! Swallern has a mobile app built with React Native, designed for smooth use on both Android and iOS.",
  },
];

export const FAQs = () => {
  const [openId, setOpenId] = useState<number | null>(1); // first FAQ open by default

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };
  return (
    <div className={styles.FAQs} id="faqs">
      <div className={styles.pageTitle}>
        <div className={styles.textTitle}></div>
        About Us
        <div className={styles.textTitle}></div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Frequently Asked Questions (FAQs)</h1>
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={`${styles.card} ${openId === faq.id ? styles.open : ""}`}
            onClick={() => toggleFAQ(faq.id)}
          >
            <div className={styles.header}>
              <h3>{faq.title}</h3>
              <span className={styles.icon}>
                {openId === faq.id ? "−" : "+"}
              </span>
            </div>
            {openId === faq.id && (
              <p className={styles.description}>{faq.description}</p>
            )}
          </div>
        ))}
        <div className={styles.btnContainer}>
          <button className={styles.btn}>Still have questions?</button>
        </div>
      </div>
    </div>
  );
};
