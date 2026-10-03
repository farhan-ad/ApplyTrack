let applications = [];
const form = document.querySelector("form");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
let loadFailed = false;

try {
  const savedApplicationsJSON = localStorage.getItem("applytrack-applications");
  if (savedApplicationsJSON !== null) {
    applications = JSON.parse(savedApplicationsJSON);
    for (const application of applications) {
      if (application.status === undefined) {
        application.status = "Applied";
      }
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
  };

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

  if (applications.length === 0 && !loadFailed) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  for (const application of applications) {
    const item = document.createElement("li");
    item.classList.add("application-card");
    const details = document.createElement("span");
    details.textContent = `${application.company} — ${application.role}`;
    const statusBadge = document.createElement("span");
    const statusClass = `status-${application.status.toLowerCase()}`;
    statusBadge.classList.add(statusClass);
    statusBadge.classList.add("status-badge");
    statusBadge.textContent = application.status;
    item.append(details, statusBadge);
    applicationList.append(item);
  }
}

renderApplications();
