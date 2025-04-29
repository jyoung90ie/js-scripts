class VideoAutoplayBehavior {
  static id = "VideoAutoplayBehavior";

  static isMatch(url, document) {
    return true;
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ VideoAutoplayBehavior started!");

    try {
      // Try to find a Wistia player first
      let wistiaPlayer = null;

      if (window._wq && typeof window._wq.push === "function") {
        yield ctx.log("⏳ Found _wq, hooking into Wistia players...");

        // Listen for any Wistia players becoming ready
        let resolvePlayerReady;
        const playerReadyPromise = new Promise((resolve) => {
          resolvePlayerReady = resolve;
        });

        window._wq.push({
          id: "_all",
          onReady: function (video) {
            wistiaPlayer = video;
            resolvePlayerReady(video);
          },
        });

        yield ctx.log("⏳ Waiting for Wistia player to become ready...");
        await playerReadyPromise;
        yield ctx.log("✅ Wistia player ready.");
      }

      // If no Wistia player detected, fallback to standard <video> element
      let videoElement = wistiaPlayer ? null : document.querySelector("video, .wistia_embed video");

      if (!wistiaPlayer && !videoElement) {
        yield ctx.log("⚠️ No video player found on the page!");
        return;
      }

      // Play the video and set speed to 2x
      if (wistiaPlayer) {
        yield ctx.log("▶️ Playing Wistia video at 2x speed...");
        wistiaPlayer.play();
        try {
          wistiaPlayer.playbackRate(2.0);
        } catch (err) {
          yield ctx.log("⚠️ Could not set Wistia playback rate: " + err.message);
        }
      } else {
        yield ctx.log("▶️ Playing HTML5 video at 2x speed...");
        await videoElement.play().catch((err) => {
          ctx.log("⚠️ videoElement.play() failed: " + err.message);
        });
        videoElement.playbackRate = 2.0;
      }

      // Wait until video finishes
      yield ctx.log("⏳ Waiting for video to complete...");

      await new Promise((resolve) => {
        if (wistiaPlayer) {
          wistiaPlayer.bind("end", () => {
            resolve();
          });
        } else {
          videoElement.addEventListener("ended", () => {
            resolve();
          });
        }
      });

      yield ctx.log("✅ Video finished playing!");

    } catch (err) {
      yield ctx.log(`❌ Error in VideoAutoplayBehavior: ${err.message}`);
    }
  }
}
