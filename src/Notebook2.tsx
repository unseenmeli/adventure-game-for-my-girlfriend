
interface Notebook2Props {
  isOpen: boolean;
  onClose: () => void;
}

const Notebook2 = ({ isOpen, onClose }: Notebook2Props) => {
  if (!isOpen) return null;

  const leftPageContent = (
    <div>
      <div className="mb-4">...to the sunset that painted our love</div>

      <img
        src="/sunsetpic.png"
        alt="Sunset together"
        className="w-full h-40 object-cover rounded-lg shadow-md mb-4"
      />

      <div className="text-sm">
        As the sun dipped below the horizon, painting the sky in shades of our
        love, I realized that every sunset is more beautiful when I'm watching
        it with you. You make ordinary moments extraordinary, turning simple
        sunsets into core memories that warm my heart forever.
      </div>
    </div>
  );

  const rightPageContent = (
    <div>
      <div className="mb-3">Before I left...</div>

      <img
        src="/beforeileft.png"
        alt="Before I left"
        className="w-full h-36 object-cover rounded-lg shadow-md mb-4"
      />

      <div className="text-sm mb-4">
        That bittersweet moment - knowing we'd be apart but feeling closer than
        ever. Distance means nothing when someone means everything.
      </div>

      <div className="text-center mt-8">
        <div
          className="text-4xl font-bold text-pink-600"
          style={{ textShadow: "2px 2px 4px rgba(255,105,180,0.3)" }}
        >
          I LOVE YOU
        </div>
        <div className="text-xl mt-2">💕 Forever and Always 💕</div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Notebook container with brown leather look */}
        <div
          className="bg-gradient-to-br from-amber-900 to-amber-800 p-6 rounded-lg shadow-2xl relative"
          style={{
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Binding/spine in the middle */}
          <div
            className="absolute left-1/2 top-6 bottom-6 w-1 bg-amber-950 transform -translate-x-1/2 z-10"
            style={{
              boxShadow:
                "inset 2px 0 4px rgba(0,0,0,0.5), inset -2px 0 4px rgba(0,0,0,0.5)",
            }}
          ></div>

          {/* Binding rings */}
          <div
            className="absolute left-1/2 top-12 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2 z-20"
            style={{ boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }}
          ></div>
          <div
            className="absolute left-1/2 top-1/2 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{ boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }}
          ></div>
          <div
            className="absolute left-1/2 bottom-12 w-4 h-4 bg-gray-400 rounded-full transform -translate-x-1/2 z-20"
            style={{ boxShadow: "inset 0 2px 3px rgba(0,0,0,0.5)" }}
          ></div>

          {/* Two-page spread */}
          <div className="flex gap-8">
            {/* Left page */}
            <div
              className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 w-96 h-[600px] p-8 relative"
              style={{
                backgroundColor: "#fffef5",
                backgroundImage: `repeating-linear-gradient(
                     transparent,
                     transparent 28px,
                     #d4d4d0 28px,
                     #d4d4d0 29px
                   )`,
                boxShadow: "inset 3px 0 10px rgba(0,0,0,0.1)",
              }}
            >
              {/* Page corner effect */}
              <div
                className="absolute top-0 right-0 w-12 h-12"
                style={{
                  background:
                    "linear-gradient(135deg, #fffef5 50%, #f5f5e8 50%)",
                  clipPath: "polygon(0 0, 100% 100%, 100% 0)",
                  boxShadow: "-2px 2px 3px rgba(0,0,0,0.1)",
                }}
              ></div>

              {/* Left page content */}
              <div
                className="font-serif text-gray-800 leading-relaxed"
                style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
              >
                {leftPageContent}
              </div>
            </div>

            {/* Right page */}
            <div
              className="bg-gradient-to-bl from-yellow-50 via-white to-yellow-50 w-96 h-[600px] p-8 relative"
              style={{
                backgroundColor: "#fffef5",
                backgroundImage: `repeating-linear-gradient(
                     transparent,
                     transparent 28px,
                     #d4d4d0 28px,
                     #d4d4d0 29px
                   )`,
                boxShadow: "inset -3px 0 10px rgba(0,0,0,0.1)",
              }}
            >
              {/* Page corner effect */}
              <div
                className="absolute top-0 left-0 w-12 h-12"
                style={{
                  background:
                    "linear-gradient(225deg, #fffef5 50%, #f5f5e8 50%)",
                  clipPath: "polygon(0 0, 0 100%, 100% 0)",
                  boxShadow: "2px 2px 3px rgba(0,0,0,0.1)",
                }}
              ></div>

              {/* Right page content */}
              <div
                className="font-serif text-gray-800 leading-relaxed"
                style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
              >
                {rightPageContent}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg"
          >
            ✕
          </button>
        </div>

        {/* Bottom text */}
        <p className="text-center text-white mt-4 text-sm opacity-75">
          Click outside to close
        </p>
      </div>
    </div>
  );
};

export default Notebook2;
