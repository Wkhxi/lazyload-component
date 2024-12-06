import {
  CSSProperties,
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

interface LazyLoadProps {
  width?: number | string;
  height?: string | number;
  className?: string; // 外层容器样式
  style?: CSSProperties; // 外层容器样式
  placeholder?: ReactNode; // 占位dom
  offset?: string | number; // 距离到可视区域？就触发加载
  onContentVisible?: () => void; // 进入可视区域的回调
  children: ReactNode;
}

const LazyLoad: FC<LazyLoadProps> = (props) => {
  const {
    className = "",
    style,
    offset = 0,
    width,
    onContentVisible,
    placeholder,
    height,
    children,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const eleObserver = useRef<IntersectionObserver | null>(null);

  const [visible, setVisible] = useState(false); // visible 时候展示 children，否则展示 placeholder

  const styles = { height, width, ...style };

  const lazyLoadHandler = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    console.log("entry", entry);

    // isIntersecting = true，从不相交到相交
    // 反之，是从相交到不相交。
    const { isIntersecting } = entry;

    if (isIntersecting) {
      setVisible(true);
      onContentVisible?.();

      const node = containerRef.current;
      if (node && node instanceof HTMLElement) {
        eleObserver.current?.unobserve(node);
      }
    }
  };

  useEffect(() => {
    const options = {
      rootMargin: typeof offset === "number" ? `${offset}px` : offset || "0px", // 距离多少进入可视区域就触发
      threshold: 0,
    };

    eleObserver.current = new IntersectionObserver(lazyLoadHandler, options);

    const node = containerRef.current;

    if (node instanceof HTMLElement) {
      eleObserver.current.observe(node);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} className={className} style={styles}>
      {visible ? children : placeholder}
    </div>
  );
};

export default LazyLoad;
