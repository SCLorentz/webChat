function getYoutubeEmbedUrl(videoUrl: string): string {
    const videoId = videoUrl.split('v=')[1];
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return embedUrl;
}

const videoUrl = 'https://www.youtube.com/watch?v=nPMr5uB2cd8';
const embedUrl = getYoutubeEmbedUrl(videoUrl);

console.log(embedUrl);