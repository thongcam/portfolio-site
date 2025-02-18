export const generateCaseStudiesURL = (title : string) => {
    return encodeURI(title).toLowerCase().replaceAll(" ", "-");
}