class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  static isMatch(url, document) {
    return true; // Apply everywhere, but we will check inside run()
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ VideoAutoPlayBehavior started!");

    try {
      // Wait for either a Thinkific video element or Wistia iframe
      yield ctx.log("⏳ Waiting for Thinkific player or Wistia iframe...");
      await ctx.until(() => {
        return (
          document.querySelector('iframe[src*="wistia"]') ||
          document.querySelector('div[class*="wistia_embed"]') || // Wistia div player (alternative)
          document.querySelector('video') || // Native video tag (rare on Thinkific but possible)
          document.querySelector('div.vjs-tech') // Thinkific often uses video.js player classes
        );
      }, { timeout: 15000 });

      yield ctx.log("✅ Video player found, attempting to autoplay...");

      // Prefer Wistia iframe autoplay first
      const iframe = document.querySelector('iframe[src*="wistia"]');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: "play" }),
          "*"
        );
        yield ctx.log("▶️ Sent play command to Wistia player via iframe.");
      } else {
        // Fall back: try native <video> autoplay
        const video = document.querySelector('video');
        if (video) {
          video.play().then(() => {
            ctx.log("▶️ Native HTML5 video play triggered.");
          }).catch((e) => {
            ctx.log(`⚠️ Native video play failed: ${e.message}`);
          });
        } else {
          yield ctx.log("⚠️ No Wistia iframe or native video found to play.");
        }
      }

      // Correct sleep (allow video buffering)
      yield ctx.log("⏳ Waiting 5 seconds for video to buffer...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Wait for network idle
      yield ctx.log("⏳ Waiting for network idle...");
      await ctx.untilNetworkIdle({ idleTime: 5000, timeout: 60000 });

      yield ctx.log("✅ Network idle, moving on.");

    } catch (err) {
      yield ctx.log(`❌ Error in VideoAutoPlayBehavior: ${err.message}`);
    }
  }
}
