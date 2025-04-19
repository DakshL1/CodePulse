import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import socket from "./sockets";

let lastVideoTime = -1;
let alertCooldowns = {};
let eyeMovementBuffer = [];
const EYE_MOVEMENT_THRESHOLD = 0.065;  // Lowered threshold for horizontal movement
const VERTICAL_EYE_MOVEMENT_THRESHOLD = 0.065; // Lowered threshold for vertical movement
const BUFFER_SIZE = 2; // Reduced buffer size for quicker detection

function shouldSendAlert(type) {
  const now = Date.now();
  if (!alertCooldowns[type] || now - alertCooldowns[type] > 5000) {
    alertCooldowns[type] = now;
    console.log(`[ALERT] Sending "${type}" alert.`);
    return true;
  }
  console.log(`[ALERT] Skipped "${type}" alert due to cooldown.`);
  return false;
}

const AiProctoring = async (videoElement, roomId, canvas = null) => {
  console.log("[INIT] AI Proctoring started.");

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
    },
    runningMode: "VIDEO"
  });

  let ctx = null;
  
  // Only create a canvas and context if canvas is not null
  if (canvas) {
    ctx = canvas.getContext("2d");
  }

  const predict = async () => {
    if (videoElement.paused || videoElement.ended) {
      requestAnimationFrame(predict);
      return;
    }

    const now = performance.now();
    if (videoElement.currentTime !== lastVideoTime) {
      lastVideoTime = videoElement.currentTime;

      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      
      // If canvas is provided, adjust canvas size
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }

      const { detections } = faceDetector.detectForVideo(videoElement, now);

      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }

      if (!detections || detections.length === 0) {
        console.log("[LOG] No face detected.");
        if (shouldSendAlert("no-face")) {
          socket.emit("alert", {
            message: "No face detected",
            type: "no-face",
            roomId
          });
        }
      } else if (detections.length > 1) {
        console.log(`[LOG] Multiple faces detected: ${detections.length}`);
        if (shouldSendAlert("multiple-faces")) {
          socket.emit("alert", {
            message: "Multiple faces detected",
            type: "multiple-faces",
            roomId
          });
        }
      } else {
        const detection = detections[0];
        const { boundingBox: bbox, keypoints } = detection;

        // Draw bounding box and keypoints only if canvas is provided
        if (ctx) {
          // Draw bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            bbox.originX * width,
            bbox.originY * height,
            bbox.width * width,
            bbox.height * height
          );

          // Draw keypoints
          keypoints.forEach((point, index) => {
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 3, 0, 2 * Math.PI);
            ctx.fill();
            console.log(`[LOG] Keypoint ${index}: x=${point.x.toFixed(4)}, y=${point.y.toFixed(4)}`);
          });
        }

        const leftEye = keypoints[1];
        const rightEye = keypoints[2];

        const eyeDiffX = Math.abs(leftEye.x - rightEye.x);
        const eyeDiffY = Math.abs(leftEye.y - rightEye.y);
        const eyeDistance = Math.sqrt(eyeDiffX ** 2 + eyeDiffY ** 2);

        // Log eye movement metrics
        console.log(`[LOG] Eye Diff X: ${eyeDiffX.toFixed(4)}, Eye Diff Y: ${eyeDiffY.toFixed(4)}`);
        console.log(`[LOG] Eye Distance: ${eyeDistance.toFixed(4)}`);

        // Check if the user is looking away (horizontal and vertical movement)
        const isLookingAway = eyeDiffX > EYE_MOVEMENT_THRESHOLD || eyeDiffY > VERTICAL_EYE_MOVEMENT_THRESHOLD;

        // Use buffer to track small movements
        eyeMovementBuffer.push(isLookingAway);
        if (eyeMovementBuffer.length > BUFFER_SIZE) {
          eyeMovementBuffer.shift();
        }

        const consistentMovement = eyeMovementBuffer.filter(Boolean).length > BUFFER_SIZE / 2;  // Consistent movement over half the buffer size

        // Log detection metrics
        // console.log("[LOG] Bounding Box:");
        // console.log(`   - originX: ${bbox.originX.toFixed(4)}`);
        // console.log(`   - originY: ${bbox.originY.toFixed(4)}`);
        // console.log(`   - width:   ${bbox.width.toFixed(4)}`);
        // console.log(`   - height:  ${bbox.height.toFixed(4)}`);
        // console.log(`[LOG] Normalized Face Area: ${bbox.width * bbox.height}`);

        if (consistentMovement) {
          if (shouldSendAlert("head-turn")) {
            socket.emit("alert", {
              message: "Interviewee might be looking away",
              type: "head-turn",
              roomId
            });
          }
        } else if (bbox.width * bbox.height < 0.05) {  // Check if the face is too small
          if (shouldSendAlert("face-too-small")) {
            socket.emit("alert", {
              message: "User might be too far from the camera",
              type: "face-too-small",
              roomId
            });
          }
        }
      }
    }

    requestAnimationFrame(predict);
  };

  predict();
};

export default AiProctoring;
