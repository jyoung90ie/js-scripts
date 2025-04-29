class WistiaAutoPlayBehavior {
  static id = "WistiaAutoPlayBehavior";

  static isMatch(url, document) {
    return true;
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ WistiaAutoPlayBehavior started!");

    try {
      // 1. Wait for Wistia script to load
      yield ctx.log("⏳ Waiting for Wistia loader script (window._wq)...");
      await ctx.until(() => {
        return window._wq && typeof window._wq.push === "function";
      }, { timeout: 30000 });

      yield ctx.log("✅ Wistia _wq API is available.");

      // 2. Register an autoplay for any player that becomes ready
      window._wq.push({
        id: "_all",
        onReady: function(video) {
          video.play().then(() => {
            console.log("▶️ Wistia video started playing automatically.");
          }).catch((err) => {
            console.log(`⚠️ Wistia video play() failed: ${err.message}`);
          });
        }
      });

      yield ctx.log("▶️ Autoplay hook registered for all players.");

      // 3. Sleep to allow video to buffer
      yield ctx.log("⏳ Waiting 5 seconds for buffering...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 4. Wait for network idle
      yield ctx.log("⏳ Waiting for network idle...");
      await ctx.untilNetworkIdle({ idleTime: 5000, timeout: 60000 });

      yield ctx.log("✅ Network idle detected, moving on.");

    } catch (err) {
      yield ctx.log(`❌ Error in WistiaAutoPlayBehavior: ${err.message}`);
    }
  }
}
