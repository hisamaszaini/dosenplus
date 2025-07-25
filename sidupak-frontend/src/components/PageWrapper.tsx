import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePageTitle } from '../contexts/PageTitleContext';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

const PageWrapper = ({ title, children }: PageWrapperProps) => {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);

  return (
    <>
      <Helmet>
        <title>{title} - SIDUPAK</title>
      </Helmet>

      {children}
    </>
  );
};

export default PageWrapper;
