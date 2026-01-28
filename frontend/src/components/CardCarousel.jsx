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

export default function CardCarousel({
  items = [],
  attendingStatus = {},
  membershipStatus = {},
  onAttend,
  onCancel,
  onItemClick,
}) {
  if (!items.length) {
    return (
      <p className="text-center mt-10 text-gray-500">
        No upcoming events
      </p>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="
          flex gap-6
          overflow-x-auto
          pb-4
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {items.map((event) => {
          const isAttending = attendingStatus[event.id];
          const isMember = membershipStatus[event.hub] ?? true;

          return (
            <div
              key={event.eventId ?? event.id}
              className="
                min-w-[320px] max-w-[320px]
                bg-white rounded-xl shadow-md
                hover:shadow-xl transition
                flex-shrink-0
              "
            >
              <img
                src={event.image}
                alt={event.title}
                className="h-48 w-full object-cover rounded-t-xl"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {event.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {event.description}
                </p>

                <p className="text-xs text-gray-500 mt-2">
                  🕒 {new Date(event.start_time).toLocaleString()}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Hub: {event.hubName}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  👥 {event.attendees_count ?? 0} attending
                </p>

                {/* ACTION BUTTON */}
<div className="mt-3">
  {!isMember ? (
    <button
      className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-sm"
      onClick={() => window.location.href = `/hubs/${event.hub}/about`}
    >
      Join hub to attend
    </button>
  ) : isAttending ? (
    <button
      className="w-full px-3 py-2 rounded-lg bg-red-500 text-white text-sm"
      onClick={() => onCancel?.(event)}
    >
      Cancel Attendance
    </button>
  ) : (
    <button
      className="w-full px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
      onClick={() => onAttend?.(event)}
    >
      Attend Event
    </button>
  )}
</div>


                {/* CARD CLICK */}
{isMember && (
  <button
    onClick={() => onItemClick?.(event)}
    className="mt-2 text-xs text-[#432dd7] hover:underline w-full"
  >
    View hub →
  </button>
)}


              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

