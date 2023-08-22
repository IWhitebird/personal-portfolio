import Resume from "./Resume.pdf";
import React, { Component } from 'react';
import { pdfjs, Document, Page } from "react-pdf";

import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class Catalogue extends Component {
  constructor(props){
    super(props);
    this.state = { numPages: null, pageNumber: 1 };
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  goToPrevPage = () => {
    const { pageNumber } = this.state
    if (pageNumber !== 1) {
      this.setState(state => ({ pageNumber: state.pageNumber - 1 }));
    }
  }
  goToNextPage = () => { 
    const { pageNumber, numPages } = this.state
    if (pageNumber !== numPages) {
      this.setState(state => ({ pageNumber: state.pageNumber + 1 }));
    }
  }
getPages = () => {
  const pages = [];
  const { numPages } = this.state;

  for (let i = 1; i <= numPages; i++) {
    pages.push(
      <Page
        key={i}
        pageNumber={i}
        scale={1.2}
        style=""
        renderTextLayer={false}
      />
    );
  }
  return pages;
}

  render() {
    return (
      <div >
        <div className="w-[400px]">
          <Document
            file={Resume}
            onLoadSuccess={this.onDocumentLoadSuccess}
          > 
            {this.getPages()}
          </Document>
        </div>
      </div>
    );
  }
}

export default Catalogue