import React from "react";

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

const AppImage: React.FC<AppImageProps> = ({ 
  src, 
  alt, 
  fallback = "/assets/images/no_image.png", 
  className = "",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = React.useState<string>(src);

  const handleError = () => {
    setImgSrc(fallback);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

AppImage.displayName = "AppImage";

export default AppImage;