let applications = [];
const form = document.querySelector("form");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
const applicationSearch = document.querySelector("#application-search");
const searchEmptyState = document.querySelector("#search-empty-state");
let loadFailed = false;

applicationSearch.addEventListener("input", function () {
  renderApplications();
});

try {
  const savedApplicationsJSON = localStorage.getItem("applytrack-applications");
  if (savedApplicationsJSON !== null) {
    applications = JSON.parse(savedApplicationsJSON);

    let idsAdded = false;

    for (const application of applications) {
      if (application.status === undefined) {
        application.status = "Applied";
      }

      if (application.id === undefined) {
        application.id = crypto.randomUUID();
        idsAdded = true;
      }
    }

    if (idsAdded) {
      const applicationsJSON = JSON.stringify(applications);
      localStorage.setItem("applytrack-applications", applicationsJSON);
    }
  }
} catch (error) {
  applications = [];
  loadFailed = true;
  formError.textContent =
    "Couldn't load saved applications. Saving is paused. Refresh to try again.";
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  if (loadFailed === true) {
    return;
  }

  const company = document.querySelector("#company").value.trim();
  const role = document.querySelector("#job-role").value.trim();
  const status = document.querySelector("#status").value;

  formError.textContent = "";
  if (!company || !role) {
    formError.textContent = "Enter a company and job role.";
    return;
  }

  const application = {
    company: company,
    role: role,
    status: status,
    id: crypto.randomUUID(),
  };

  if (application.id === undefined) {
    application.id = crypto.randomUUID();
  }

  applications.push(application);
  try {
    const applicationsJSON = JSON.stringify(applications);
    localStorage.setItem("applytrack-applications", applicationsJSON);
  } catch (error) {
    applications.pop();
    formError.textContent =
      "Couldn’t save this application. Your entries are still here. Please try again.";
    return;
  }
  renderApplications();
  form.reset();
});

const applicationList = document.querySelector("#application-list");

function renderApplications() {
  applicationList.replaceChildren();

  const query = applicationSearch.value.trim().toLowerCase();

  const visibleApplications = applications.filter(function (savedApplication) {
    return (
      savedApplication.company.toLowerCase().includes(query) ||
      savedApplication.role.toLowerCase().includes(query)
    );
  });

  if (
    applications.length > 0 &&
    visibleApplications.length === 0 &&
    !loadFailed
  ) {
    searchEmptyState.hidden = false;
  } else {
    searchEmptyState.hidden = true;
  }

  if (applications.length === 0 && !loadFailed) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  for (const application of visibleApplications) {
    const cardError = document.createElement("p");
    cardError.classList.add("card-error");
    cardError.setAttribute("role", "alert");

    const item = document.createElement("li");
    item.classList.add("application-card");

    const details = document.createElement("span");
    details.textContent = `${application.company} — ${application.role}`;

    const statusBadge = document.createElement("span");
    const statusClass = `status-${application.status.toLowerCase()}`;
    statusBadge.classList.add(statusClass);
    statusBadge.classList.add("status-badge");
    statusBadge.textContent = application.status;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.classList.add("delete-button");
    deleteButton.id = `delete-${application.id}`;

    const statusSelect = document.createElement("select");
    statusSelect.classList.add("status-select");
    statusSelect.id = `status-${application.id}`;

    const cardActions = document.createElement("div");
    cardActions.classList.add("card-actions");
    cardActions.append(statusSelect, deleteButton);

    item.append(details, statusBadge, cardActions, cardError);
    applicationList.append(item);

    deleteButton.addEventListener("click", function () {
      cardError.textContent = "";

      const currentIndex = visibleApplications.findIndex(
        function (savedApplication) {
          return savedApplication.id === application.id;
        },
      );

      const focusApplication =
        visibleApplications[currentIndex + 1] ||
        visibleApplications[currentIndex - 1];

      const remainingApplications = applications.filter(
        function (savedApplication) {
          return savedApplication.id !== application.id;
        },
      );

      try {
        const applicationsJSON = JSON.stringify(remainingApplications);
        localStorage.setItem("applytrack-applications", applicationsJSON);
      } catch (error) {
        cardError.textContent =
          "Couldn't delete this application. Please try again.";
        cardError.scrollIntoView({ block: "nearest" });
        return;
      }

      applications = remainingApplications;
      formError.textContent = "";

      requestAnimationFrame(function () {
        renderApplications();

        if (focusApplication) {
          const nextDeleteButton = document.querySelector(
            `#delete-${focusApplication.id}`,
          );

          nextDeleteButton.focus();
        } else {
          applicationSearch.focus();
        }
      });
    });

    for (const status of ["Applied", "Interview", "Offer", "Rejected"]) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      statusSelect.append(option);
    }

    statusSelect.value = application.status;
    statusSelect.setAttribute(
      "aria-label",
      `Status for ${application.company} — ${application.role}`,
    );

    statusSelect.addEventListener("change", function () {
      cardError.textContent = "";

      const updatedApplications = applications.map(function (savedApplication) {
        if (savedApplication.id === application.id) {
          return {
            ...savedApplication,
            status: statusSelect.value,
          };
        }

        return savedApplication;
      });

      try {
        const applicationJSON = JSON.stringify(updatedApplications);
        localStorage.setItem("applytrack-applications", applicationJSON);
      } catch (error) {
        statusSelect.value = application.status;
        cardError.textContent =
          "Couldn't update this status. Please try again.";
        cardError.scrollIntoView({ block: "nearest" });
        return;
      }

      applications = updatedApplications;
      formError.textContent = "";

      requestAnimationFrame(function () {
        renderApplications();

        const refreshedStatusSelect = document.querySelector(
          `#status-${application.id}`,
        );

        refreshedStatusSelect.focus({ preventScroll: true });
      });
    });
  }
}

renderApplications();
