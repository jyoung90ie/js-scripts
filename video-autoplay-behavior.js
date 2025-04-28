class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  // Required static method: should return true if behavior should run
  static isMatch(url, document) {
    return true; // Always run (you can later filter if needed)
  }

  // Required static method: called at behavior startup
  static init() {
    // No special setup needed, but method must exist
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ Custom VideoAutoPlayBehavior script started!");

    // Wait for Wistia iframe to appear
    yield ctx.log("⏳ Waiting for Wistia iframe...");
    await ctx.waitForElement('iframe[src*="wistia"]');

    yield ctx.log("✅ Wistia iframe found, attempting to play video...");

    const iframe = document.querySelector('iframe[src*="wistia"]');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ method: "play" }),
        "*"
      );
      yield ctx.log("▶️ Play command sent to Wistia player.");
    } else {
      yield ctx.log("⚠️ Wistia iframe not accessible.");
    }

    // Optionally wait a few seconds to let buffering start
    yield ctx.sleep(5000);

    yield ctx.log("⏳ Waiting for network to become idle...");
    await ctx.waitForNetworkIdle(5000);

    yield ctx.log("✅ Network idle detected, moving on.");
  }
}
