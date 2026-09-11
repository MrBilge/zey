"use client";

import { useId, useState } from "react";
import styles from "./FaqItem.module.css";

type FaqItemProps = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const answerId = `${id}-answer`;
  const questionId = `${id}-question`;

  return (
    <div className={styles.item}>
      <h3 className={styles.heading}>
        <button
          id={questionId}
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={answerId}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          {question}
          <span className={styles.icon} aria-hidden="true">+</span>
        </button>
      </h3>
      <div
        id={answerId}
        className={styles.panel}
        data-open={isOpen}
        role="region"
        aria-labelledby={questionId}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className={styles.content}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}
