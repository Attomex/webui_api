import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import LetterGlitch from "./components/LetterGlitch";
import FuzzyText from "./components/FuzzyText";

const NotFound = ({ errorCode, errorText, backTo }) => {
    const navigate = useNavigate(); // Хук для навигации

    // Обработчик клика для перехода на главную страницу
    const handleGoBack = () => {
        navigate(backTo);
    };

    return (
        <div
            style={{
                position: "relative", // Родительский контейнер должен быть relative
                width: "100vw",
                height: "100vh",
                overflow: "hidden", // Убираем скролл
            }}>
            {/* LetterGlitch как фон */}
            <div
                style={{
                    position: "absolute", // Фон должен быть absolute
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1, // Фон должен быть ниже контента
                }}>
                <LetterGlitch glitchColors={['#2b4539', '#61dca3', '#61b3dc', '#646464']} />
            </div>

            <Button
                type="dashed"
                style={{
                    backgroundColor: "transparent",
                    top: "10px",
                    left: "10px",
                    position: "absolute",
                    padding: "0px",
                    width: "160px",
                    height: "25px",
                    zIndex: 3, // Кнопка должна быть выше фона
                    cursor: "pointer", // Меняем курсор при наведении
                }}
                onClick={handleGoBack} // Обработчик клика
            >
                <FuzzyText fontSize="clamp(1rem, 1vw, 1rem)" color="white" baseIntensity={0.05} hoverIntensity={0.2}>
                    Вернуться назад
                </FuzzyText>
            </Button>

            {/* Контент */}
            <div
                style={{
                    position: "relative", // Контент должен быть relative
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    zIndex: 2, // Контент должен быть выше фона
                }}>
                <FuzzyText style={{ zIndex: 10 }} fontSize="clamp(4rem, 20vw, 10rem)" color="white">
                    {errorCode}
                </FuzzyText>
                <FuzzyText style={{ zIndex: 10 }} fontSize="clamp(2rem, 10vw, 5rem)" color="white">
                    {errorText}
                </FuzzyText>
            </div>
        </div>
    );
};

export default NotFound;
