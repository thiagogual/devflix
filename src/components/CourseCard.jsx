// src/components/CourseCard.jsx - Premium 2025 Design
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getVideoThumbnail,
  buildGumletThumbnailUrl,
} from "../utils/videoUtils";

// Formatar data para exibição curta
const formatClassDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return {
    weekday: weekdays[date.getDay()],
    date: `${day}/${month}`,
    time: `${hours}:${minutes}`,
  };
};

// Mapear ID da aula para a chave de data correspondente
const getClassDateKey = (classId) => {
  const mapping = {
    1: "aula1",
    2: "aula2",
    3: "aula3",
    4: "aula4",
    5: "aulaBonus", // Aula bônus como aula 5
  };
  return mapping[classId];
};

const CourseCard = ({ course, basePath = "", classDates = null }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Verificar se coverImage é um caminho local inválido (ex: /images/aula1.jpg)
  const isLocalPlaceholder = (url) => {
    return url && url.startsWith("/images/") && !url.startsWith("http");
  };

  const imageSource = useMemo(() => {
    // 1. Usar coverImage se for uma URL válida (não placeholder local)
    if (course.coverImage && !isLocalPlaceholder(course.coverImage)) {
      return course.coverImage;
    }
    // 2. Se tiver configuração do Gumlet, usar
    if (course.gumletCollectionId && course.gumletAssetId) {
      return buildGumletThumbnailUrl(
        course.gumletCollectionId,
        course.gumletAssetId,
      );
    }
    // 3. Gerar thumbnail do vídeo (YouTube ou Gumlet)
    if (course.videoLink) {
      const thumbnail = getVideoThumbnail(course.videoLink);
      if (thumbnail) {
        return thumbnail;
      }
    }
    // 4. Fallback
    return null;
  }, [course]);

  // Fallback: se a imagem principal falhar, tentar thumbnail do vídeo
  const fallbackImage = useMemo(() => {
    if (course.videoLink) {
      return getVideoThumbnail(course.videoLink);
    }
    if (course.gumletCollectionId && course.gumletAssetId) {
      return buildGumletThumbnailUrl(
        course.gumletCollectionId,
        course.gumletAssetId,
      );
    }
    return null;
  }, [course]);

  const currentImage =
    imageError && fallbackImage ? fallbackImage : imageSource;

  // Obter a data da aula baseado no ID
  const getClassDate = () => {
    if (!classDates) return null;
    const dateKey = getClassDateKey(course.id);
    if (!dateKey || !classDates[dateKey]) return null;
    return formatClassDate(classDates[dateKey]);
  };

  const classDate = getClassDate();

  return (
    <motion.div
      className="course-card group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -inset-1 rounded-2xl -z-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 9, 20, 0.4) 0%, rgba(249, 115, 22, 0.3) 100%)",
              filter: "blur(15px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <div className="relative overflow-hidden rounded-2xl">
        {/* Thumbnail Image */}
        {currentImage ? (
          <motion.img
            src={currentImage}
            alt={`Capa da ${course.title}`}
            className="course-card-image w-full aspect-video object-cover"
            animate={{
              scale: isHovered ? 1.08 : 1,
              filter: isHovered ? "brightness(0.4)" : "brightness(1)",
            }}
            transition={{ duration: 0.4 }}
            onError={(e) => {
              // Fallback para hqdefault se maxresdefault não existir
              if (e.target.src.includes("maxresdefault")) {
                e.target.src = e.target.src.replace(
                  "maxresdefault",
                  "hqdefault",
                );
              } else if (!imageError) {
                setImageError(true);
              }
            }}
          />
        ) : (
          <motion.div
            className="course-card-image w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
            animate={{
              scale: isHovered ? 1.08 : 1,
              filter: isHovered ? "brightness(0.4)" : "brightness(1)",
            }}
            transition={{ duration: 0.4 }}
          >
            <svg
              className="w-16 h-16 text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        )}

        {/* Premium badge with date */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div
            className="hidden sm:block px-3 py-1.5 rounded-lg font-display font-semibold text-xs text-white backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 9, 20, 0.9) 0%, rgba(249, 115, 22, 0.9) 100%)",
              boxShadow: "0 4px 15px rgba(229, 9, 20, 0.3)",
            }}
          >
            AULA {course.id}
          </div>
          {/* {classDate && (
            <div
              className="px-2 py-1.5 rounded-lg font-display text-xs text-white backdrop-blur-sm flex items-center gap-1"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{classDate.weekday} {classDate.date} às {classDate.time}</span>
            </div>
          )} */}
        </div>

        {/* Play button indicator */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{
              background: "rgba(229, 9, 20, 0.9)",
              boxShadow: "0 0 30px rgba(229, 9, 20, 0.5)",
            }}
          >
            <svg
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.div>

        {/* Overlay Content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-5"
          style={{
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)",
          }}
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3
            className="font-display font-bold text-lg mb-2 text-white"
            animate={{ y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            {course.title}
          </motion.h3>

          {course.description && (
            <motion.p
              className="text-sm text-gray-300 mb-4 line-clamp-2"
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {course.description}
            </motion.p>
          )}

          <motion.a
            href={course.videoLink || `${basePath}/aula/${course.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative overflow-hidden py-2.5 px-5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 group/btn"
            style={{
              background:
                "linear-gradient(135deg, #E50914 0%, #ff4d4d 50%, #f97316 100%)",
              backgroundSize: "200% 200%",
              boxShadow: "0 4px 15px rgba(229, 9, 20, 0.4)",
            }}
            animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{
              backgroundPosition: "100% 50%",
              boxShadow: "0 6px 20px rgba(229, 9, 20, 0.5)",
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <svg
              className="w-4 h-4 relative z-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="relative z-10">Assistir Agora</span>
          </motion.a>
        </motion.div>
      </div>

      {/* Mobile info - always visible */}
      <div
        className="p-4 md:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 1) 0%, rgba(10, 10, 10, 1) 100%)",
        }}
      >
        <h3 className="font-display font-bold text-sm truncate mb-3 text-white">
          {course.title}
        </h3>
        <a
          href={course.videoLink || `${basePath}/aula/${course.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white"
          style={{
            background:
              "linear-gradient(135deg, #E50914 0%, #ff4d4d 50%, #f97316 100%)",
            boxShadow: "0 4px 15px rgba(229, 9, 20, 0.3)",
          }}
        >
          Assistir Agora
        </a>
      </div>
    </motion.div>
  );
};

export default CourseCard;
