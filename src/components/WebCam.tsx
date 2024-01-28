import { useEffect, useRef, useState, useCallback } from "react";
import {
    FACEMESH_TESSELATION,
    HAND_CONNECTIONS,
    Holistic,
    POSE_CONNECTIONS,
} from "@mediapipe/holistic";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { TResult } from "@/types";

const WebCam = ({
    onHolisticResults,
}: {
    onHolisticResults: (results: Partial<TResult>) => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const drawResults = useCallback((results: Partial<TResult>) => {
        if (!videoRef.current || !canvasRef.current) {
            return;
        }

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        let canvasCtx = canvasRef.current.getContext("2d")!;
        canvasCtx.save();
        canvasCtx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
        );
        // Use `Mediapipe` drawing functions
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: "#00cff7",
            lineWidth: 1,
        });
        drawLandmarks(canvasCtx, results.poseLandmarks, {
            color: "#ff0364",
            lineWidth: 1,
        });
        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
            color: "#C0C0C070",
            lineWidth: 1,
        });
        if (results.faceLandmarks && results.faceLandmarks.length === 478) {
            //draw pupils
            drawLandmarks(
                canvasCtx,
                [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
                {
                    color: "#ffe603",
                    lineWidth: 1,
                }
            );
        }
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
            color: "#eb1064",
            lineWidth: 1,
        });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
            color: "#00cff7",
            lineWidth: 1,
        });
        drawConnectors(
            canvasCtx,
            results.rightHandLandmarks,
            HAND_CONNECTIONS,
            {
                color: "#22c3e3",
                lineWidth: 1,
            }
        );
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
            color: "#ff0364",
            lineWidth: 1,
        });
    }, []);

    const onResults = useCallback(
        (results: Partial<TResult>) => {
            // Draw landmark guides
            drawResults(results);
            // Animate model
            onHolisticResults(results);
            // animateVRM(currentVrm, results);
        },
        [drawResults, onHolisticResults]
    );

    const animate = async () => {
        if (videoRef.current !== null && holistic !== null) {
            try {
                await holistic.send({ image: videoRef.current });
            } catch (e) {
                console.log("unable to load ML module!", e);
            }
        }

        requestAnimationFrame(animate);
    };

    const [holistic, setHolistic] = useState(() => {
        // }
        const newHolistic = new Holistic({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
            },
        });

        newHolistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            refineFaceLandmarks: true,
        });
        newHolistic.onResults(onResults);
        return newHolistic;
    });
    useEffect(() => {
        const handleLoadedMetadata = () => {
            // if (holistic) {
            //     holistic.close();
            // }
            const newHolistic = new Holistic({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5.1675471629/${file}`;
                },
            });

            newHolistic.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7,
                refineFaceLandmarks: true,
            });

            newHolistic.onResults(onResults);

            setHolistic(newHolistic);

            requestAnimationFrame(animate);
        };
        if (videoRef.current !== null) {
            // set playback rate to 0.5
            videoRef.current.playbackRate = 0.5;
            videoRef.current.addEventListener("canplay", handleLoadedMetadata);
        }

        return () => {
            if (videoRef.current !== null) {
                videoRef.current.removeEventListener(
                    "canplay",
                    handleLoadedMetadata
                );
            }

            if (holistic) {
                holistic.close();
            }
        };
    }, [videoRef]);

    return (
        <div className="absolute bottom-0 z-[-1] flex flex-row-reverse items-end justify-between w-full min-h-screen">
            <video
                className="input_video w-80 "
                ref={videoRef}
                autoPlay
                playsInline
                muted
                loop
                src="/bird.mp4"
            />
            <canvas className="h-80" ref={canvasRef}></canvas>
        </div>
    );
};

export default WebCam;
