import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";

function createTextTexture(gl, text, font, color) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.font = font;
  const metrics = ctx.measureText(text);
  canvas.width = metrics.width + 40;
  canvas.height = 60;

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;

  return texture;
}

class Media {
  constructor({ gl, scene, geometry, item, index, length, viewport, onClick }) {
    this.item = item;
    this.onClick = onClick;

    this.texture = new Texture(gl);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = item.image;
    img.onload = () => (this.texture.image = img);

    this.program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tMap, vUv);
        }
      `,
      uniforms: { tMap: { value: this.texture } },
    });

    this.plane = new Mesh(gl, { geometry, program: this.program });
    this.plane.setParent(scene);

    this.index = index;
    this.length = length;
    this.viewport = viewport;

    this.plane.scale.set(viewport.width / length, viewport.height * 0.6, 1);
    this.plane.position.x =
      (index - length / 2) * (this.plane.scale.x + 0.5);

    this.plane.onClick = () => onClick(item);

    this.addText(gl);
  }

  addText(gl) {
    const titleTex = createTextTexture(gl, this.item.title, "bold 24px sans-serif", "#fff");
    const subtitleTex = createTextTexture(
      gl,
      this.item.subtitle,
      "16px sans-serif",
      "#ccc"
    );

    this.addLabel(gl, titleTex, -0.6);
    this.addLabel(gl, subtitleTex, -0.85);
  }

  addLabel(gl, texture, y) {
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tMap, vUv);
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry: new Plane(gl), program });
    mesh.scale.set(1.5, 0.3, 1);
    mesh.position.y = y;
    mesh.setParent(this.plane);
  }
}

export default function CardCarousel({ items, onItemClick }) {
  return (
    <div className="relative">
      <div
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: "smooth" }}
      >
        {items.map((item) => (
          <div
            key={item.eventId}
            onClick={() => onItemClick?.(item)}
            className="min-w-[280px] max-w-[280px] snap-start cursor-pointer
                       bg-white rounded-xl shadow-md hover:shadow-xl transition"
          >
            <img
              src={item.image}
              alt={item.title}
              className="h-40 w-full object-cover rounded-t-xl"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg truncate">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.hubName}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.startTime).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

