export default function Logo({ size = 44 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background tile */}
      <rect width="44" height="44" rx="11" fill="#4f46e5" />

      {/* Shopping bag body */}
      <path
        d="M14 19.5h16l-1.8 10.5H15.8L14 19.5Z"
        fill="white"
      />

      {/* Bag handle */}
      <path
        d="M18 19.5v-3.5a4 4 0 0 1 8 0v3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Location pin — sits bottom-right, partly over bag */}
      <circle cx="30.5" cy="28.5" r="7" fill="#FF8521" />
      {/* Pin dot */}
      <circle cx="30.5" cy="27" r="2" fill="white" />
      {/* Pin bottom point */}
      <path
        d="M30.5 29a4.5 4.5 0 0 0 3.5-4.5 3.5 3.5 0 1 0-7 0A4.5 4.5 0 0 0 30.5 29Z"
        fill="white"
        fillOpacity="0"
      />
      <path
        d="M27 26.5a3.5 3.5 0 1 1 7 0c0 1.8-3.5 5-3.5 5s-3.5-3.2-3.5-5Z"
        fill="white"
      />
      <circle cx="30.5" cy="26.5" r="1.3" fill="#FF8521" />
    </svg>
  );
}
