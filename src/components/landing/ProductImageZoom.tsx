"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import styles from "./ProductSection.module.css";

type ProductImageZoomProps = { src: string; size: string };

export default function ProductImageZoom({ src, size }: ProductImageZoomProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const alt = `Zey ${size} zeytinyağı ürün ambalajı`;

  function moveZoom(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--zoom-origin", `${x}% ${y}%`);
  }

  function openModal() {
    dialogRef.current?.showModal();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`product-image ${styles.imageContainer}`}
        aria-label={`${size} ürün görselini büyüt`}
        aria-haspopup="dialog"
        onPointerMove={moveZoom}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--zoom-origin", "center");
        }}
        onClick={openModal}
      >
        <span className={`tag ${styles.tag}`}>ZEY KOLEKSİYONU · {size}</span>
        <Image
          src={src}
          alt={alt}
          width={1024}
          height={1024}
          sizes="(max-width:760px) 100vw,50vw"
          className={styles.image}
        />
        <span className={styles.hint}>Yakından incele <span aria-hidden="true">↗</span></span>
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={`Zey ${size} büyütülmüş ürün görseli`}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <span>ZEY · {size}</span>
            <button type="button" autoFocus onClick={() => dialogRef.current?.close()} aria-label="Önizlemeyi kapat">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <Image src={src} alt={alt} width={1024} height={1024} sizes="(max-width:760px) 95vw, 85vh" className={styles.modalImage} />
        </div>
      </dialog>
    </>
  );
}
