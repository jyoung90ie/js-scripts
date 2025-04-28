class VideoAutoPlayBehavior {
  static id = "VideoAutoPlayBehavior";

  static isMatch(url, document) {
    return true; // Apply to all pages
  }

  static init() {
    return {};
  }

  async* run(ctx) {
    yield ctx.log("✅ VideoAutoPlayBehavior started!");

    // Wait for Wistia iframe to appear
    yield ctx.log("⏳ Waiting for Wistia iframe...");
    await ctx.page.waitForSelector('iframe[src*="wistia"]', { timeout: 10000 });

    yield ctx.log("✅ Wistia iframe found, trying to autoplay...");

    const iframe = await ctx.page.$('iframe[src*="wistia"]');
    if (iframe) {
      const iframeContent = await iframe.contentFrame();
      if (iframeContent) {
        // Inject play command into Wistia iframe
        await iframeContent.evaluate(() => {
          window.postMessage(
            JSON.stringify({ method: "play" }),
            "*"
          );
        });
        yield ctx.log("▶️ Play command sent to Wistia player inside iframe.");
      } else {
        yield ctx.log("⚠️ Could not access iframe content.");
      }
    } else {
      yield ctx.log("⚠️ No iframe found.");
    }

    // Allow video to buffer a little bit
    yield ctx.sleep(5000);

    // Wait for network idle
    yield ctx.log("⏳ Waiting for network to become idle...");
    await ctx.page.waitForNetworkIdle({ idleTime: 5000, timeout: 60000 });

    yield ctx.log("✅ Network idle detected, moving on.");
  }
}
