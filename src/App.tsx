import { Canvas } from "@react-three/fiber";
import Model from "./components/Model";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import WebCam from "./components/WebCam";
import { TResult } from "@/types";

function App() {
    let results: Partial<TResult>;

    const onHolisticResults = (newResults: Partial<TResult>) => {
        results = newResults;
    };

    const getHolisticResults = () => {
        return results;
    };
    return (
        <div className="min-h-screen">
            <Canvas
                className="min-h-screen"
                style={{ width: "100vw", height: "100vh" }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.001} />
                    <directionalLight color="white" position={[1, 1, 1]} />
                    <OrbitControls
                        enableDamping={true}
                        enableRotate={true}
                        enableZoom={true}
                        enablePan={true}
                    />
                    <Model getHolisticResults={getHolisticResults} />
                </Suspense>
            </Canvas>
            <WebCam onHolisticResults={onHolisticResults} />
        </div>
    );
}

export default App;
