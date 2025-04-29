// Improved WistiaAutoPlayBehavior for Thinkific/Wistia hybrid pages

export default class WistiaAutoPlayBehavior {
  static isMatch(url, document) {
    // Always apply on Thinkific/Wistia pages
    return true;
  }

  static init() {
    return {};
  }

  static async run(ctx) {
    ctx.log.debug('Starting WistiaAutoPlayBehavior');

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function waitForVideoElement(maxRetries = 10) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const wistiaEmbed = document.querySelector('.wistia_embed');
        if (wistiaEmbed) {
          ctx.log.debug(`Found .wistia_embed on attempt ${attempt}`);
          return wistiaEmbed;
        }
        ctx.log.debug(`Waiting for .wistia_embed (attempt ${attempt})`);
        await sleep(1000);
      }
      throw new Error('Failed to find .wistia_embed element after retries');
    }

    async function attemptAutoPlayWithWistiaApi() {
      return new Promise((resolve, reject) => {
        if (!window._wq || typeof window._wq.push !== 'function') {
          ctx.log.warn('_wq API not available');
          return reject(new Error('_wq not available'));
        }

        ctx.log.debug('Using _wq to hook into video playback');

        window._wq.push({
          id: '_all',
          onReady: function(video) {
            try {
              ctx.log.debug('Wistia video ready via _wq, attempting play');
              video.play();
              resolve();
            } catch (err) {
              ctx.log.error('Error during video.play()', {error: err});
              reject(err);
            }
          }
        });
      });
    }

    async function fallbackPlayClick(embed) {
      ctx.log.debug('Attempting fallback click on embed');
      try {
        embed.click();
        await sleep(500);
        ctx.log.info('Clicked on video embed for fallback autoplay');
      } catch (err) {
        ctx.log.error('Failed fallback click', {error: err});
      }
    }

    try {
      const videoEmbed = await waitForVideoElement();

      try {
        await attemptAutoPlayWithWistiaApi();
      } catch (apiError) {
        ctx.log.warn('Falling back to manual click autoplay');
        await fallbackPlayClick(videoEmbed);
      }

      ctx.log.info('Waiting extra time to allow video to buffer');
      await sleep(15000); // Allow buffering and download

      ctx.log.debug('Waiting for network idle');
      try {
        await ctx.waitForNetworkIdle(5000, 60000);
      } catch (err) {
        ctx.log.warn('waitForNetworkIdle timed out', {error: err});
      }

      ctx.log.info('WistiaAutoPlayBehavior complete');

    } catch (err) {
      ctx.log.error('Failed to autoplay video', {error: err});
    }
  }
}
