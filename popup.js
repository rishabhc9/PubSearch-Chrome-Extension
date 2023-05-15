document.addEventListener('DOMContentLoaded', () => {
  const submitButton = document.getElementById('submit-button');
  const orcidInput = document.getElementById('orcid-input');
  const nameInput = document.getElementById('name-input');
  const resultTextarea = document.getElementById('result-textarea');
  const saveButton = document.getElementById('save-button');

  submitButton.addEventListener('click', () => {
    const orcid = orcidInput.value.trim();
    const name = nameInput.value.trim();

    if (orcid.length === 0 && name.length === 0) {
      resultTextarea.value = 'Please enter a valid ORCID or Name.';
      return;
    }

    let url = '';

    if (orcid.length > 0) {
      url = `https://pub.orcid.org/v3.0/${orcid}/works`;
    } else if (name.length > 0) {
      url = `https://pub.orcid.org/v3.0/search?q=${encodeURIComponent(name)}&rows=10`;
    }

    // Fetch publications from ORCID API
    fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the API response to examine its structure

        if (orcid.length > 0) {
          const publications = data.group;

          // Display publications on the webpage
          let result = '';

          if (publications && publications.length > 0) {
            result += 'My publications:\n\n';

            publications.forEach(group => {
              const workSummaries = group['work-summary'];

              workSummaries.forEach(work => {
                const title = work.title.title?.value || 'Untitled';
                const journal = work['journal-title']?.value || 'Unknown Journal';
                const year = work['publication-date']?.year?.value || 'Unknown Year';

                result += `${title}\n${journal}, ${year}\n\n`;
              });
            });
          } else {
            result = 'No publications found.';
          }

          resultTextarea.value = result;
        } else if (name.length > 0) {
          const searchResults = data.result;

          if (searchResults && searchResults.length > 0) {
            const firstResult = searchResults[0];
            const firstOrcid = firstResult['orcid-identifier'].path;

            // Fetch publications for the first ORCID ID obtained from name-based search
            fetch(`https://pub.orcid.org/v3.0/${firstOrcid}/works`, {
              headers: {
                Accept: 'application/json',
              },
            })
              .then(response => response.json())
              .then(data => {
                console.log(data); // Log the API response to examine its structure

                const publications = data.group;

                // Display publications on the webpage
                let result = '';

                if (publications && publications.length > 0) {
                  result += 'Publications:\n\n';

                  publications.forEach(group => {
                    const workSummaries = group['work-summary'];

                    workSummaries.forEach(work => {
                      const title = work.title.title?.value || 'Untitled';
                      const journal = work['journal-title']?.value || 'Unknown Journal';
                      const year = work['publication-date']?.year?.value || 'Unknown Year';

                      result += `${title}\n${journal}, ${year}\n\n`;
                    });
                  });
                } else {
                  result = 'No publications found for the first ORCID ID.';
                }

                resultTextarea.value = result;
              })
              .catch(error => {
                console.error(error);
                resultTextarea.value = 'An error occurred while fetching publications for the first ORCID ID.';
              });
          } else {
            resultTextarea.value = 'No search results found.';
          }
        }
      })
      .catch(error => {
        console.error(error);
        resultTextarea.value = 'An error occurred while fetching publications.';
      });
  });

  saveButton.addEventListener('click', () => {
    const textToSave = resultTextarea.value;

    if (textToSave.length === 0) {
      return;
    }

    const blob = new Blob([textToSave], { type: 'text/plain' });
    const filename = 'publications.txt';
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Programmatically click the link to start the download
    link.click();

    // Cleanup by revoking the object URL
    URL.revokeObjectURL(url);
  });
});

