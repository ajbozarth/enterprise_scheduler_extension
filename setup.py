from setuptools import setup, find_packages

try:
    long_desc = open('README.md').read()
except:
    long_desc = ''

setup(
    name="enterprise_scheduler_extension",
    url="https://github.com/codait/enterprise_scheduler_extension",
    author="Luciano Resende",
    author_email="lresende@apache.org",
    version="0.0.2",
    packages=find_packages(),
    install_requires=[
        "jupyter==1"
    ],
    include_package_data=True,
    description="Jupyter Extension for Submitting notebooks",
    long_description=long_desc,
)